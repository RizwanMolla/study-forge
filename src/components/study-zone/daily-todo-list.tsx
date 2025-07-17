'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createTodo, toggleTodo, deleteTodo } from '@/lib/actions/todo.actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { ITodo } from '@/lib/models/todo.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function DailyTodoList({ initialTodos }: { initialTodos: ITodo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddTodo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newTodo.trim()) {
      startTransition(async () => {
        try {
          const createdTodo = await createTodo(newTodo.trim());
          setTodos((prev) => [...prev, createdTodo]);
          setNewTodo('');
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to add to-do.', variant: 'destructive' });
        }
      });
    }
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    startTransition(async () => {
      try {
        await toggleTodo(id, completed);
        setTodos((prev) =>
          prev.map((todo) => {
            if (todo._id === id) {
              // Directly mutate the completed property instead of spreading
              todo.completed = !todo.completed;
              return todo;
            }
            return todo;
          })
        );
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to update to-do.', variant: 'destructive' });
      }
    });
  };
  
  const handleDeleteTodo = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((todo) => todo._id !== id));
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete to-do.', variant: 'destructive' });
      }
    });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>My Day</CardTitle>
            <CardDescription>Keep track of your tasks for today.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleAddTodo} className="flex items-center gap-2 mb-4">
                <Input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                disabled={isPending}
                />
                <Button type="submit" disabled={isPending || !newTodo.trim()}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                    <span className="sr-only">Add Task</span>
                </Button>
            </form>

            <div className="space-y-2">
                {todos.length > 0 ? (
                    todos.map((todo) => (
                    <div key={todo._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                        <Checkbox
                        id={`todo-${todo._id}`}
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo._id, todo.completed)}
                        disabled={isPending}
                        />
                        <label
                        htmlFor={`todo-${todo._id}`}
                        className={`flex-1 text-sm ${todo.completed ? 'text-muted-foreground line-through' : ''}`}
                        >
                        {todo.title}
                        </label>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTodo(todo._id)}
                        disabled={isPending}
                        >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">No tasks for today. Add one above!</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}