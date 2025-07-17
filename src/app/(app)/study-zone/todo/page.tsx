import { TodoTabs } from '@/components/study-zone/todo-tabs';
import { getTodos, getWeeklyTodos } from '@/lib/actions/todo.actions';

export default async function TodoPage() {
  const todos = await getTodos();
  const weeklyTodos = await getWeeklyTodos();

  return <TodoTabs initialTodos={todos} initialWeeklyTodos={weeklyTodos} />;
}
