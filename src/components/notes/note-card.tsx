
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, FileText } from "lucide-react";
import { Note } from "@/contexts/notes-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NoteCardProps {
  note: Note;
  subjectColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function NoteCard({ note, subjectColor, onEdit, onDelete, onClick }: NoteCardProps) {
  const previewText = note.content 
    ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '')
    : 'Sin contenido';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevenir click si se hace en el menú de opciones
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return;
    }
    onClick();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: subjectColor }}
            />
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {note.title}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild data-dropdown-trigger="true">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {previewText}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Nota
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(note.updatedAt), 'dd/MM/yyyy', { locale: es })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
