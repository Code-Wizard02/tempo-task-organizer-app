
import React, { useState, useEffect, useRef } from "react";
import { useSubjects, type Subject } from "@/contexts/subject-context";
import { useProfessors, type Professor } from "@/contexts/professor-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Plus, Edit, Trash, ArrowUpDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Local interface that matches what we need in this component
interface SubjectWithDetails {
  id: string;
  name: string;
  credits: number;
  professor_id: string | null;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfessorWithDetails {
  id: string;
  full_name: string;
  email: string;
}

const Subjects = () => {
  const { subjects, isLoading: isLoadingSubjects, addSubject, updateSubject: updateContextSubject, deleteSubject } = useSubjects();
  const { professors, isLoading: isLoadingProfessors } = useProfessors();
  const [localSubjects, setLocalSubjects] = useState<SubjectWithDetails[]>([]);
  const [localProfessors, setLocalProfessors] = useState<ProfessorWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null as string | null, direction: "ascending" as "ascending" | "descending" });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithDetails | null>(null);
  const [subjectData, setSubjectData] = useState({
    name: "",
    credits: 0,
    professor_id: null as string | null,
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  // Load subjects and professors from the database
  const fetchSubjectsFromDb = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, professors(id, full_name)');
      
      if (error) throw error;
      
      const formattedSubjects: SubjectWithDetails[] = data.map(item => ({
        id: item.id,
        name: item.name,
        credits: item.credits || 0,
        professor_id: item.professor_id || null,
        color: item.color || "#000000",
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      setLocalSubjects(formattedSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las materias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProfessorsFromDb = async () => {
    try {
      const { data, error } = await supabase
        .from('professors')
        .select('*');
      
      if (error) throw error;
      
      const formattedProfessors: ProfessorWithDetails[] = data.map(item => ({
        id: item.id,
        full_name: item.name,
        email: item.email
      }));
      
      setLocalProfessors(formattedProfessors);
    } catch (error) {
      console.error("Error fetching professors:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesores.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubjectsFromDb();
    fetchProfessorsFromDb();
  }, []);

  // Update local subject data when context data changes
  useEffect(() => {
    if (subjects.length > 0) {
      const mappedSubjects = subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        credits: 0, // Default value since it's not in the context
        professor_id: null, // Default value since it's not in the context
        color: subject.color,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt
      }));
      setLocalSubjects(prevSubjects => {
        // Only update if we don't already have local data
        return prevSubjects.length === 0 ? mappedSubjects : prevSubjects;
      });
    }
  }, [subjects]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateDialogOpen = () => {
    setSubjectData({ name: "", credits: 0, professor_id: null });
    setIsCreateDialogOpen(true);
  };

  const handleEditDialogOpen = (subject: SubjectWithDetails) => {
    setSelectedSubject(subject);
    setSubjectData({
      name: subject.name,
      credits: subject.credits,
      professor_id: subject.professor_id,
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubjectData(prev => ({
      ...prev,
      [name]: name === "credits" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setSubjectData(prev => ({
      ...prev,
      professor_id: value === "null" ? null : value,
    }));
  };

  const createSubject = async (subjectData: { name: string, credits: number, professor_id: string | null }) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: subjectData.name,
          credits: subjectData.credits,
          professor_id: subjectData.professor_id,
          color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random color
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newSubject: SubjectWithDetails = {
          id: data[0].id,
          name: data[0].name,
          credits: data[0].credits,
          professor_id: data[0].professor_id,
          color: data[0].color,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        // Add to local state
        setLocalSubjects(prevSubjects => [newSubject, ...prevSubjects]);
        
        // Add to context
        addSubject({
          name: newSubject.name,
          color: newSubject.color
        });
        
        return newSubject;
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      throw error;
    }
  };
  
  const updateSubject = async (id: string, updateData: { name?: string, credits?: number, professor_id?: string | null }) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const updatedSubject: SubjectWithDetails = {
          id: data[0].id,
          name: data[0].name,
          credits: data[0].credits,
          professor_id: data[0].professor_id,
          color: data[0].color,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        // Update local state
        setLocalSubjects(prevSubjects => 
          prevSubjects.map(subject => subject.id === id ? updatedSubject : subject)
        );
        
        // Update context if name changed
        if (updateData.name) {
          updateContextSubject(id, { name: updateData.name });
        }
        
        return updatedSubject;
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      throw error;
    }
  };

  const handleCreateSubject = async () => {
    try {
      if (!subjectData.name || subjectData.credits <= 0) {
        toast({
          title: "Error",
          description: "Por favor, complete todos los campos.",
          variant: "destructive",
        });
        return;
      }
      await createSubject(subjectData);
      toast({
        title: "Éxito",
        description: "Materia creada correctamente.",
      });
      setIsCreateDialogOpen(false);
      setSubjectData({ name: "", credits: 0, professor_id: null });
    } catch (error) {
      console.error("Error al crear la materia:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la materia.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubject = async () => {
    if (!selectedSubject) return;
    try {
      if (!subjectData.name || subjectData.credits <= 0) {
        toast({
          title: "Error",
          description: "Por favor, complete todos los campos.",
          variant: "destructive",
        });
        return;
      }
      await updateSubject(selectedSubject.id, subjectData);
      toast({
        title: "Éxito",
        description: "Materia actualizada correctamente.",
      });
      setIsEditDialogOpen(false);
      setSelectedSubject(null);
      setSubjectData({ name: "", credits: 0, professor_id: null });
    } catch (error) {
      console.error("Error al actualizar la materia:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la materia.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
      
      // Update local state
      setLocalSubjects(prevSubjects => 
        prevSubjects.filter(subject => subject.id !== subjectId)
      );
      
      toast({
        title: "Éxito",
        description: "Materia eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar la materia:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la materia.",
        variant: "destructive",
      });
    }
  };

  const sortedSubjects = React.useMemo(() => {
    let sortableItems = [...localSubjects];
    if (sortConfig.key !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key as keyof SubjectWithDetails] < b[sortConfig.key as keyof SubjectWithDetails]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key as keyof SubjectWithDetails] > b[sortConfig.key as keyof SubjectWithDetails]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [localSubjects, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredSubjects = sortedSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find professor name by ID
  const getProfessorName = (professorId: string | null) => {
    if (!professorId) return "Sin profesor";
    const professor = localProfessors.find(p => p.id === professorId);
    return professor ? professor.full_name : "Sin profesor";
  };

  const isAllLoading = isLoading || isLoadingSubjects || isLoadingProfessors;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Materias</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Buscar materia..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-md"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button onClick={handleCreateDialogOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Materia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAllLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando materias...
            </div>
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort("name")}>
                      Nombre
                      <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                    </th>
                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort("credits")}>
                      Créditos
                      <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Profesor
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map(subject => (
                    <tr key={subject.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {subject.name}
                      </th>
                      <td className="px-6 py-4">
                        {subject.credits}
                      </td>
                      <td className="px-6 py-4">
                        {getProfessorName(subject.professor_id)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditDialogOpen(subject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará la materia permanentemente. ¿Deseas continuar?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Materia</DialogTitle>
            <DialogDescription>
              Añade una nueva materia al sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={subjectData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">
                Créditos
              </Label>
              <Input
                type="number"
                id="credits"
                name="credits"
                value={subjectData.credits.toString()}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professor" className="text-right">
                Profesor
              </Label>
              <Select onValueChange={handleSelectChange} value={subjectData.professor_id || "null"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Sin profesor</SelectItem>
                  {localProfessors.map(professor => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateSubject}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>
              Edita los detalles de la materia.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={subjectData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">
                Créditos
              </Label>
              <Input
                type="number"
                id="credits"
                name="credits"
                value={subjectData.credits.toString()}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professor" className="text-right">
                Profesor
              </Label>
              <Select onValueChange={handleSelectChange} value={subjectData.professor_id || "null"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Sin profesor</SelectItem>
                  {localProfessors.map(professor => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleUpdateSubject}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;
