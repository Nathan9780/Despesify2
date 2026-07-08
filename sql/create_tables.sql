sendo o empresarial aquele que vai ter que aceitar));

-- Tasks table (separate from projects but related)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_id UUID,
    project_id UUID,
    name TEXT,
    type TEXT DEFAULT 'default',
    avatar TEXT,
    online BOOLEAN DEFAULT false,
    email TEXT,
    phone TEXT,
    rating NUMERIC(2,1),
    invested NUMERIC(15,2),
    projects INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS para tarefas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Limpar politicas de tarefas
DROP POLICY IF EXISTS "Ver tarefas" ON tasks;
DROP POLICY IF EXISTS "Criar tarefas" ON tasks;
DROP POLICY IF EXISTS "Atualizar tarefas" ON tasks;
DROP POLICY IF EXISTS "Deletar tarefas" ON tasks;

-- Criar politicas para tasks
CREATE POLICY "Ver tarefas" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Criar tarefas" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Atualizar tarefas" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Deletar tarefas" ON tasks FOR DELETE USING (auth.uid() = user_id);
