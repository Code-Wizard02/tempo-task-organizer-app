
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProfessors } from "@/contexts/professor-context";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, SortAsc, SortDesc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/contexts/subject-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const professorSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  subjectIds: z.array(z.string()).min(1, { message: "Debe seleccionar al menos una materia" }),
});

type ProfessorFormValues = z.infer<typeof professorSchema>;

export default function Professors() {
  const { professors, addProfessor, updateProfessor, deleteProfessor } = useProfessors();
  const { subjects } = useSubjects();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<string | null>(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<'name' | 'email'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  
  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      name: "",
      email: "",
      subjectIds: [],
    },
  });
  
  // Filtered and sorted professors
  const filteredProfessors = useMemo(() => {
    return professors
      .filter(professor => {
        const matchesSearch = 
          professor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          professor.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSubject = 
          !subjectFilter || professor.subjectIds.includes(subjectFilter);
        
        return matchesSearch && matchesSubject;
      })
      .sort((a, b) => {
        if (sortDirection === 'asc') {
          return a[sortField].localeCompare(b[sortField]);
        } else {
          return b[sortField].localeCompare(a[sortField]);
        }
      });
  }, [professors, searchTerm, sortField, sortDirection, subjectFilter]);

  const toggleSort = (field: 'name' | 'email') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openCreateDialog = () => {
    form.reset({ name: "", email: "", subjectIds: [] });
    setEditingProfessor(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const professor = professors.find(p => p.id === id);
    if (professor) {
      form.reset({
        name: professor.name,
        email: professor.email,
        subjectIds: professor.subjectIds,
      });
      setEditingProfessor(id);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteProfessor = (id: string) => {
    deleteProfessor(id);
  };

  const onSubmit = (data: ProfessorFormValues) => {
    if (editingProfessor) {
      updateProfessor(editingProfessor, data);
      toast({
        title: "Profesor actualizado",
        description: `El profesor ${data.name} ha sido actualizado`,
      });
    } else {
      const newProfessor = {
        name: data.name,
        full_name: data.name, 
        email: data.email,
        subjectIds: data.subjectIds,
      };
      addProfessor(newProfessor);
      toast({
        title: "Profesor agregado",
        description: `El profesor ${data.name} ha sido agregado`,
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profesores</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Profesor
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros y búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={subjectFilter}
              onValueChange={setSubjectFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las materias</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: subject.color }}></div>
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Profesores</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProfessors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay profesores registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                      <div className="flex items-center">
                        Nombre
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('email')}>
                      <div className="flex items-center">
                        Correo Electrónico
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Materias</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessors.map((professor) => (
                    <TableRow key={professor.id}>
                      <TableCell className="font-medium">{professor.name}</TableCell>
                      <TableCell>{professor.email}</TableCell>
                      <TableCell>
                        {professor.subjectIds.map(subjectId => {
                          const subject = subjects.find(s => s.id === subjectId);
                          return subject ? (
                            <span 
                              key={subject.id} 
                              className="inline-block px-2 py-1 mr-1 mb-1 rounded-md text-xs"
                              style={{ backgroundColor: subject.color, color: '#fff' }}
                            >
                              {subject.name}
                            </span>
                          ) : null;
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(professor.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProfessor(professor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProfessor ? 'Editar Profesor' : 'Agregar Profesor'}</DialogTitle>
            <DialogDescription>
              Complete los datos del profesor.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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

              <FormField
                control={form.control}
                name="subjectIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materias</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          if (field.value.includes(value)) {
                            field.onChange(field.value.filter(v => v !== value));
                          } else {
                            field.onChange([...field.value, value]);
                          }
                        }}
                        value={field.value[0] || ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar materia" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: subject.color }}></div>
                                {subject.name}
                                {field.value.includes(subject.id) && " (Seleccionada)"}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((subjectId) => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <div 
                            key={subject.id} 
                            className="flex items-center px-2 py-1 rounded-md text-xs"
                            style={{ backgroundColor: subject.color, color: '#fff' }}
                          >
                            {subject.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 text-white hover:bg-transparent"
                              onClick={() => field.onChange(field.value.filter(v => v !== subjectId))}
                            >
                              ×
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingProfessor ? 'Guardar Cambios' : 'Agregar Profesor'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
