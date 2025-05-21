import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, SortAsc, SortDesc } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubjects } from "@/contexts/subject-context";
import { useProfessors } from "@/contexts/professor-context";
import { useToast } from "@/hooks/use-toast";

const subjectSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  professor_id: z.string().nullable(),
  color: z.string().min(1, { message: "Debe seleccionar un color" }),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { professors } = useProfessors();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"name" | "professor_id">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [professorFilter, setProfessorFilter] = useState<string>("");

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      professor_id: null,
      color: "#4f46e5",
    },
  });

  // Filtered and sorted subjects
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((subject) => {
        const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProfessor = !professorFilter || subject.professor_id === professorFilter;
        return matchesSearch && matchesProfessor;
      })
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortField].localeCompare(b[sortField]);
        } else {
          return b[sortField].localeCompare(a[sortField]);
        }
      });
  }, [subjects, searchTerm, sortField, sortDirection, professorFilter]);

  const toggleSort = (field: "name" | "professor_id") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openCreateDialog = () => {
    form.reset({ name: "", professor_id: null, color: "#4f46e5" });
    setEditingSubject(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const subject = subjects.find((s) => s.id === id);
    if (subject) {
      form.reset({
        name: subject.name,
        professor_id: subject.professor_id,
        color: subject.color,
      });
      setEditingSubject(id);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id);
    toast({
      title: "Materia eliminada",
      description: "La materia ha sido eliminada correctamente.",
    });
  };

  const onSubmit = (data: SubjectFormValues) => {
    if (editingSubject) {
      updateSubject(editingSubject, data);
      toast({
        title: "Materia actualizada",
        description: `La materia ${data.name} ha sido actualizada.`,
      });
    } else {
      addSubject(data as Required<SubjectFormValues>);
      toast({
        title: "Materia agregada",
        description: `La materia ${data.name} ha sido agregada.`,
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Materias</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Materia
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
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={professorFilter} onValueChange={setProfessorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por profesor" />
              </SelectTrigger>
              <SelectContent>
                {professors.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center">
              <Button variant="outline" onClick={() => { setSearchTerm(""); setProfessorFilter(""); }}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Materias</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay materias registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                      <div className="flex items-center">
                        Nombre
                        {sortField === "name" && (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("professor_id")}>
                      <div className="flex items-center">
                        Profesor
                        {sortField === "professor_id" && (
                          sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Color</TableHead> {/* Nueva columna */}
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: subject.color }}
                          title={subject.color} // Tooltip con el código del color
                        ></div>
                      </TableCell>
                      <TableCell>
                        {professors.find((p) => p.id === subject.professor_id)?.full_name || "Sin profesor"}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(subject.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(subject.id)}>
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
            <DialogTitle>{editingSubject ? "Editar Materia" : "Agregar Materia"}</DialogTitle>
            <DialogDescription>Complete los datos de la materia.</DialogDescription>
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
                      <Input placeholder="Nombre de la materia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesor</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                        value={field.value || "null"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">Sin profesor</SelectItem>
                          {professors.map((professor) => (
                            <SelectItem key={professor.id} value={professor.id}>
                              {professor.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
          {/* Grid de colores predefinidos */}
          <div className="grid grid-cols-6 gap-2">
            {[
              "#4f46e5", // Azul
              "#10b981", // Verde
              "#ef4444", // Rojo
              "#eab308", // Amarillo
              "#6366f1", // Indigo
              "#f43f5e", // Rosa
              "#22d3ee", // Cyan
              "#a855f7", // Púrpura
              "#f97316", // Naranja
              "#84cc16", // Lima
              "#64748b", // Gris
              "#000000", // Negro
            ].map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${
                  field.value === color ? "border-black" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => field.onChange(color)}
              />
            ))}
          </div>

          {/* Barra inferior para selector avanzado */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">Color seleccionado:</span>
            <div
              className="w-8 h-8 rounded-full border"
              style={{ backgroundColor: field.value }}
              title={field.value}
            ></div>
          </div>
        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{editingSubject ? "Guardar Cambios" : "Agregar Materia"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}