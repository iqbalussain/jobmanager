
-- Create chat groups table
CREATE TABLE public.chat_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  job_order_id UUID REFERENCES public.job_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('job_group', 'direct')),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat group members table
CREATE TABLE public.chat_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chat_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.chat_groups(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  job_order_id UUID REFERENCES public.job_orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_groups
CREATE POLICY "Users can view groups they are members of" 
  ON public.chat_groups 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members 
      WHERE group_id = chat_groups.id AND user_id = auth.uid()
    ) OR 
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  );

CREATE POLICY "Authorized users can create groups" 
  ON public.chat_groups 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role, 'salesman'::app_role])
  );

-- RLS Policies for chat_group_members
CREATE POLICY "Users can view group members for their groups" 
  ON public.chat_group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members cgm 
      WHERE cgm.group_id = chat_group_members.group_id AND cgm.user_id = auth.uid()
    ) OR 
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  );

CREATE POLICY "Group admins can manage members" 
  ON public.chat_group_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members cgm 
      WHERE cgm.group_id = chat_group_members.group_id 
      AND cgm.user_id = auth.uid() 
      AND cgm.role = 'admin'
    ) OR 
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their groups" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_group_members 
      WHERE group_id = chat_messages.group_id AND user_id = auth.uid()
    ) OR 
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  );

CREATE POLICY "Group members can send messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_group_members 
      WHERE group_id = chat_messages.group_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments for accessible messages" 
  ON public.message_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_group_members cgm ON cm.group_id = cgm.group_id
      WHERE cm.id = message_attachments.message_id AND cgm.user_id = auth.uid()
    ) OR 
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  );

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', true);

-- Enable realtime for chat tables
ALTER TABLE public.chat_groups REPLICA IDENTITY FULL;
ALTER TABLE public.chat_group_members REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_attachments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;

-- Function to auto-create chat group when job order is created
CREATE OR REPLACE FUNCTION public.create_job_chat_group()
RETURNS TRIGGER AS $$
DECLARE
  group_id UUID;
  customer_name TEXT;
BEGIN
  -- Get customer name for group naming
  SELECT name INTO customer_name 
  FROM public.customers 
  WHERE id = NEW.customer_id;
  
  -- Create chat group for the job order
  INSERT INTO public.chat_groups (name, job_order_id, type, created_by)
  VALUES (
    'Job #' || NEW.job_order_number || ' - ' || COALESCE(customer_name, 'Unknown Customer'),
    NEW.id,
    'job_group',
    NEW.created_by
  )
  RETURNING id INTO group_id;
  
  -- Add creator as admin
  INSERT INTO public.chat_group_members (group_id, user_id, role)
  VALUES (group_id, NEW.created_by, 'admin');
  
  -- Add designer if assigned
  IF NEW.designer_id IS NOT NULL THEN
    INSERT INTO public.chat_group_members (group_id, user_id, role)
    VALUES (group_id, NEW.designer_id, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
  
  -- Add salesman if assigned
  IF NEW.salesman_id IS NOT NULL THEN
    INSERT INTO public.chat_group_members (group_id, user_id, role)
    VALUES (group_id, NEW.salesman_id, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-creating chat groups
CREATE TRIGGER create_job_chat_group_trigger
  AFTER INSERT ON public.job_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_job_chat_group();
