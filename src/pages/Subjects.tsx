
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSubjects } from "@/contexts/subject-context";
import { useProfessors } from "@/contexts/professor-context";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Plus, Pencil, Trash2, UserPlus, Loader2, AlertDialog, 
  AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger, 
  Search, ArrowUpDown, ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/auth-context";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const subjectSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  color: z.string().min(4, { message: "Debe seleccionar un color" }),
  professorId: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

const professorSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
});

type ProfessorFormValues = z.infer<typeof professorSchema>;

const predefinedColors = [
  { name: "Azul", value: "#4f46e5" },
  { name: "Verde", value: "#10b981" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Naranja", value: "#f97316" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Morado", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Celeste", value: "#0891b2" },
];

export default function Subjects() {
  const { subjects, isLoading: isLoadingSubjects, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { professors, isLoading: isLoadingProfessors, addProfessor, getProfessorsBySubject } = useProfessors();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfessorDialogOpen, setIsProfessorDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#4f46e5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const subjectForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      color: "#4f46e5",
      professorId: "",
    },
  });

  const professorForm = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const openCreateDialog = () => {
    subjectForm.reset({ name: "", color: "#4f46e5", professorId: "" });
    setSelectedColor("#4f46e5");
    setEditingSubject(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      const subjectProfessors = getProfessorsBySubject(subject.id);
      const professorId = subjectProfessors.length > 0 ? subjectProfessors[0].id : "";
      
      subjectForm.reset({
        name: subject.name,
        color: subject.color,
        professorId: professorId,
      });
      setSelectedColor(subject.color);
      setEditingSubject(id);
      setIsDialogOpen(true);
    }
  };

  const prepareDeleteSubject = (id: string) => {
    setSubjectToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (subjectToDelete) {
      await deleteSubject(subjectToDelete);
      setDeleteConfirmOpen(false);
      setSubjectToDelete(null);
    }
  };

  const onSubmitSubject = async (data: SubjectFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject, {
          name: data.name,
          color: data.color
        });
        
        // Si se seleccionó un profesor, asignar la materia
        if (data.professorId) {
          // La lógica para asignar profesor a materia se manejará en una función separada
          // que será llamada después de añadir la materia
        }
      } else {
        // Ensure all required fields are present when adding a new subject
        const newSubject = {
          name: data.name,
          color: data.color
        };
        
        const result = await addSubject(newSubject);
        
        // Si se seleccionó un profesor y se creó la materia correctamente, asignar
        if (data.professorId && result?.id) {
          // La asignación se maneja en otro contexto
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar la materia:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitProfessor = async (data: ProfessorFormValues) => {
    setIsSubmitting(true);
    try {
      // Add the new professor
      const newProfessorData = {
        name: data.name,
        email: data.email,
        subjectIds: [] // Inicialmente sin materias asignadas
      };
      
      await addProfessor(newProfessorData);
      setIsProfessorDialogOpen(false);
      professorForm.reset({ name: "", email: "" });
      
      toast({
        title: "Profesor creado",
        description: "El profesor ha sido añadido correctamente",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al guardar el profesor:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el profesor",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    subjectForm.setValue("color", color);
  };

  // Función para ordenar las materias
  const sortSubjects = (a: any, b: any, column: string) => {
    if (!column) return 0;
    
    const aValue = a[column];
    const bValue = b[column];
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  };

  // Función para manejar el clic en una columna para ordenar
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filtrar y ordenar las materias
  const filteredSubjects = subjects
    .filter(subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortColumn ? sortSubjects(a, b, sortColumn) : 0);

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="mb-4">Debes iniciar sesión para ver esta página.</p>
        <Button onClick={() => window.location.href = "/login"}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // Mostrar estado de carga
  if (isLoadingSubjects || isLoadingProfessors) {
    return (
      <div className="container mx-auto py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Cargando materias...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Materias</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materias..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openCreateDialog} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Materia
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Materias</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron materias con ese término de búsqueda" : "No hay materias registradas"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="flex items-center p-0 h-auto font-semibold"
                      >
                        Nombre
                        {sortColumn === 'name' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('color')}
                        className="flex items-center p-0 h-auto font-semibold"
                      >
                        Color
                        {sortColumn === 'color' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Profesores</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => {
                    const subjectProfessors = getProfessorsBySubject(subject.id);
                    return (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div 
                              className="w-6 h-6 rounded-full mr-2" 
                              style={{ backgroundColor: subject.color }}
                            />
                            <span>{subject.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subjectProfessors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {subjectProfessors.map(prof => (
                                <span key={prof.id} className="inline-block px-2 py-1 bg-secondary rounded-md text-xs">
                                  {prof.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin profesores asignados</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(subject.id)}
                            disabled={isSubmitting}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => prepareDeleteSubject(subject.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar materia */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubject} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Editar Materia' : 'Agregar Materia'}</DialogTitle>
            <DialogDescription>
              Complete los datos de la materia.
            </DialogDescription>
          </DialogHeader>
          <Form {...subjectForm}>
            <form onSubmit={subjectForm.handleSubmit(onSubmitSubject)} className="space-y-4">
              <FormField
                control={subjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la materia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subjectForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            style={{ borderLeftWidth: '8px', borderLeftColor: selectedColor }}
                          >
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: selectedColor }}
                            />
                            {selectedColor}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="grid grid-cols-4 gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                className={`w-10 h-10 rounded-full border-2 ${selectedColor === color.value ? 'border-black dark:border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => handleColorSelect(color.value)}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <Input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => handleColorSelect(e.target.value)}
                            className="mt-2 w-full h-8"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subjectForm.control}
                name="professorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesor Asignado (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar profesor (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professors.map((professor) => (
                          <SelectItem key={professor.id} value={professor.id}>
                            {professor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">Profesores disponibles</h4>
                    <p className="text-xs text-muted-foreground">
                      {professors.length === 0 
                        ? "No hay profesores registrados" 
                        : `${professors.length} profesor(es) disponible(s)`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProfessorDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nuevo Profesor
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : editingSubject ? (
                    'Guardar Cambios'
                  ) : (
                    'Agregar Materia'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Quick Professor Dialog */}
      <Dialog open={isProfessorDialogOpen} onOpenChange={setIsProfessorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Profesor Rápido</DialogTitle>
            <DialogDescription>
              Agregar un profesor para asociarlo a la materia.
            </DialogDescription>
          </DialogHeader>
          <Form {...professorForm}>
            <form onSubmit={professorForm.handleSubmit(onSubmitProfessor)} className="space-y-4">
              <FormField
                control={professorForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del profesor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={professorForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Agregar Profesor'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
