'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createWeeklyTodo, toggleTodo, deleteTodo } from '@/lib/actions/todo.actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { ITodo } from '@/lib/models/todo.model';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WeeklyTodoPlanner({ initialWeeklyTodos }: { initialWeeklyTodos: ITodo[] }) {
  const [todos, setTodos] = useState(initialWeeklyTodos);
  const [newActivity, setNewActivity] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddActivity = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newActivity.trim()) {
      startTransition(async () => {
        try {
          const createdTodo = await createWeeklyTodo(newActivity.trim(), selectedDay);
          setTodos((prev) => [...prev, createdTodo].sort((a,b) => daysOfWeek.indexOf(a.dayOfWeek!) - daysOfWeek.indexOf(b.dayOfWeek!)));
          setNewActivity('');
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to add activity.', variant: 'destructive' });
        }
      });
    }
  };

  const handleDeleteActivity = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((todo) => todo._id !== id));
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete activity.', variant: 'destructive' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Weekly Routine</CardTitle>
        <CardDescription>Plan your recurring weekly activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddActivity} className="flex flex-col md:flex-row items-center gap-2 mb-6">
          <Input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="Add a new weekly activity..."
            disabled={isPending}
            className="flex-grow"
          />
           <Select value={selectedDay} onValueChange={setSelectedDay} disabled={isPending}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                    {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          <Button type="submit" disabled={isPending || !newActivity.trim()} className="w-full md:w-auto">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Activity
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map(day => {
                const dayTodos = todos.filter(t => t.dayOfWeek === day);
                return (
                    <div key={day} className="p-4 rounded-lg border bg-card">
                        <h3 className="font-semibold mb-3">{day}</h3>
                        <div className="space-y-2">
                           {dayTodos.length > 0 ? dayTodos.map(todo => (
                               <div key={todo._id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                   <p className="flex-1">{todo.title}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDeleteActivity(todo._id)}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                               </div>
                           )) : (
                               <p className="text-xs text-muted-foreground italic">No activities planned.</p>
                           )}
                        </div>
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
