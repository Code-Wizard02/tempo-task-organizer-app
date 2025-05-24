
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder } from "lucide-react";
import { Subject } from "@/contexts/subject-context";

interface SubjectFolderProps {
  subject: Subject;
  noteCount: number;
  onClick: () => void;
}

export function SubjectFolder({ subject, noteCount, onClick }: SubjectFolderProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
            style={{ backgroundColor: `${subject.color}20`, border: `2px solid ${subject.color}` }}
          >
            <Folder 
              className="h-6 w-6"
              style={{ color: subject.color }}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
          {subject.name}
        </h3>
        
        {subject.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {subject.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
