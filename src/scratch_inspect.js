import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckvzjdryjxiobubptvps.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdnpqZHJ5anhpb2J1YnB0dnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTgzODksImV4cCI6MjA5Nzg5NDM4OX0.t5vlNL2yZcx406DGs-Mfhya8QcPIdQfn2XPjbuShYkA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const testMaterial = {
    name: 'Teste de Colunas',
    category: 'Construção',
    quantity: 10,
    minimum_quantity: 5,
    unit_price: 2.5,
    supplier: 'Fornecedor Teste',
    unit: 'unidades'
  };

  const { data, error } = await supabase
    .from('materials')
    .insert([testMaterial])
    .select();

  if (error) {
    console.error('Insert error:', error.message, error.details, error.code);
  } else {
    console.log('Insert success! Columns exist:', Object.keys(data[0]));
    // Clean up
    const { error: delError } = await supabase
      .from('materials')
      .delete()
      .eq('id', data[0].id);
    if (delError) console.error('Delete cleanup error:', delError);
  }
}

testInsert();
