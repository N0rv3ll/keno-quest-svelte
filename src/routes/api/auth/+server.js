import { supabase } from "$lib/utils/supabaseClient.js";

export const POST = async ({ request }) => {
    try { 
      const body = await request.json();
      const { session, event } = body

        if (event === "SIGNED_IN") {
          // insert a row to your user table when a new user logs in
          const { data, error } = await supabase
            .from('users') 
            .insert([ { id: session.user.id } ]) 
            .select();  
    
          // Optional error handling from supabase here, you can update a UI component and inform user
          if (error) throw error;  
        } 
  
       return new Response(
            JSON.stringify({
              message: "Supabase auth handled"
            }), {status: 200})
  
     } catch (error) {
       return new Response(
         JSON.stringify({ 
           message: "Something went wrong" 
        }), { status: 500}) 
      } 
}