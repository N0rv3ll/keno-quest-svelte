<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<script>
    import { onMount, afterUpdate } from 'svelte'
    import Auth from '@supabase/auth-ui-svelte';
    import '@supabase/auth-ui-svelte/style.css';

    import { supabase } from '$lib/utils/supabaseClient.js'
  
    let user = null;
  
    onMount(async () => {
      supabase.auth.onAuthStateChange((event, session) => {
        user = session?.user || null;
      })
    })

    let showAuth = true;

    const handleAuth = (e) => {
      if (e.detail?.session) {
        // upon authentication call /api/auth endpoint, passing JWT to it,
        // you might also save the returned userId for later use 
        fetch('/api/auth', {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            event: e.detail.event,
            session: e.detail.session
          })
        })
        user = e.detail.session.user
        showAuth = false;
      } else if (e.detail?.error) {
        console.error(e.detail.error); // Handle error  (consider displaying feedback!) 
      }  
    }
  </script> 

   <Auth 
        supabaseClient={supabase}
        providers={['github', 'google']} 
        socialLayout="horizontal" 
        magicLink
        on:authenticate={handleAuth}
      />
      <script>  
        import { spring } from 'svelte/motion';  
        import { generateKenoNumbers, calculatePayout } from '$lib/utils/kenoGameLogic.js';
        import Crystal from '$lib/components/Crystal.svelte';  
        import BonusGame from '$lib/components/BonusGame.svelte'; 
        import { supabase } from '$lib/utils/supabaseClient.js';  
        import Auth from '@supabase/auth-ui-svelte';
        import '@supabase/auth-ui-svelte/style.css';
      
       //  Store your game results, keyed by date played for uniqueness: 
       let allGamesResults = [];
      
      
        let selectedNumbers = [];
        let winningNumbers = [];  
        let payout = 0;  
        let betAmount = 1;  
        let isMaxNumbersReached = false; 
        let isLoading = false;
        let showBonus = false; 
        let bonusMultiplier = 1;   
        let user = null; 
      
        let soundEnabled = true; 
      
       onMount(async () => {
       const { data } = await supabase.auth.getSession()
      
       user = data?.session?.user;
      
       // This call gets user's session whenever browser is loaded/refreshed. So call another function to update balance in store
       await getBalance() 
      
       supabase.auth.onAuthStateChange(async (event, session) => { 
           // This call updates 'user' reactively whenever a user authenticates. Call the balance fetching code from within here.
          
           if (event === 'SIGNED_IN') user = session.user; 
           if (event === 'SIGNED_OUT') user = null;  
           await getBalance() 
        });  
       });
      
      
        $:  isPlayDisabled =  isLoading  ||  selectedNumbers.length  <  1;  
      
       // Logic to generate winning numbers and show results. Then add code to check if bonus round is needed.
        const handlePlay = async () => { 
           isLoading = true; 
           
            // This part generates winning numbers, calculate pay outs 
           winningNumbers = generateKenoNumbers();
      
           // Check for matching numbers & temporary payout. (you will update this payout again after potential bonus is awarded!) 
            let  matched = selectedNumbers.filter(num  =>  winningNumbers.includes(num)); 
           let  tempPayout = calculatePayout(matched.length, betAmount); 
           payout = tempPayout * bonusMultiplier // Initially setting payout based on normal gameplay 
      
           if (user) {
             try {
                 // Example bonus round condition!  
               if (matched.length >= 5) { 
                   //  Let's hold off on saving the results to the database  
                   showBonus = true;
                   // Calculate updatedPayout after bonus and update database and balances using existing code  
               } else {
                    // Immediately save to the database
                    payout = tempPayout; 
                    // update user's balance by amount in `payout`
                    
                    await Promise.all([
                        updateBalanceInDB(payout),
                        saveGameResults()
                    ]); 
       
                   console.log("Game Data Saved!"); 
               }  
      
             } catch (error) { 
                console.error("Error during play or data update:", error); // Be specific for logging! 
             }  finally { 
               // Make sure loading spinner is gone.
                 isLoading  =  false;  
             }
           }
      
        };  
      
       const getBalance = async () => {
          if(user) { 
           try {
               const { data, error } = await supabase 
                 .from('users')
                 .select('balance')
                 .eq('id', user?.id)  // Adjust the column name based on your table 
                 .single();
      
                 if(error) throw error // Rethrow error to catch and display the same
      
               if (data) {
                  balance = data.balance || 0; // Initialize with 0 if no balance data found  
               } else {
                  //  You might add a user to your table if you can't find data for them
                  console.error('User has no data in users table! You might want to add them to your database:  User: ', user)
               }  
           } catch (error) {
             console.error('Supabase fetch balance error:', error)
           }
          }
         };
      
      
       // (We will add the handleClaimBonus later - see the Daily Bonus Implementation in earlier steps!)  
      
      const handleNumberSelect = (event) => {  
           const number  = event.detail.number; 
      
          if  (selectedNumbers.includes(number)) { 
              selectedNumbers  =  selectedNumbers.filter(n  =>  n  !==  number); 
              isMaxNumbersReached  =  false;  
           } else  if  (selectedNumbers.length  <  10) {  
               selectedNumbers  =  [...selectedNumbers, number]; 
                if (selectedNumbers.length === 9)  { 
                  isMaxNumbersReached =  true;  
               }  
            } else {  
              console.log("Can't select more numbers!")  
            }
        };
      
       // Background Animation (Svelte's  spring() ):
        let bgOpacity = spring( 
           {  opacity: 1 },  { stiffness:  50,  damping:  10  });  
      
      const saveGameResults = async () => {
       if(user) {
          const { data, error } = await supabase.from("keno_games").insert([
           {
             user_id: user.id,
             bet_amount: betAmount,
             selected_numbers: selectedNumbers, 
             winning_numbers: winningNumbers,
             payout: payout
           }
          ]);
      
          if (error) { 
            console.error("Error inserting game results:", error);  
            // Optional: Set error to be shown to the user, as an alternative to console
           return; 
          } 
      
           allGamesResults  =  [...allGamesResults, data] 
      
           console.log("Game Data Saved!"); 
       }
      };
      
       
       async function updateBalanceInDB(amount) {  
          try {
               const  {  error  }  =  await  supabase 
                  .from('users')  
                  .update({  balance: balance  + amount  })
                  .eq('id',  user.id)  // Adjust column names as needed!
      
              if  (error) {
                console.error(error) 
                // You might want to set an error state here to show it to the user
                throw error; 
              }
       
           } catch  (error) { 
                console.error('Update error',  error); 
           }  
       } 
       
      
      
        function  handleBonusMultiplierChange(value) {
          bonusMultiplier =  value;  
        } 
      
      </script> 
      
      <animated.div style="{$bgOpacity}" class="keno-game-container">
      
          <h1 class="title"> ✨ Keno Quest ✨</h1>
      
           {#if user} 
             <div class="user-info"> 
                <p>Welcome, {user.email}</p> 
                <p> Balance: ${balance} </p> 
               </div> 
           {:else}
               <p> Log in to play and track your scores! </p>  
           {/if}
      
         {/* Your cave background image in your  .cave-background  CSS */ }
         <div class="cave-background">
            {/* ... */ }
         </div>
          
      
           <div class="crystal-grid">
               {#each Array(80) as _, i}
                   <Crystal 
                    number={i + 1} 
                    isSelected={selectedNumbers.includes(i + 1)}
                    isWinningNumber={winningNumbers.includes(i + 1)}
                    on:select={handleNumberSelect}
                   /> 
               {/each} 
          </div> 
          <div class="controls"> 
               <label for="bet"> Bet Amount:</label> 
               <input type="number" name="bet" bind:value={betAmount}  min="1"  class="bet-input" /> 
      
               <button on:click={handlePlay} class="play-button" disabled={isPlayDisabled}>
                   { isLoading ? 'Exploring…'  :  'Explore the Cave!' } 
               </button> 
      
               <button on:click={handleQuickPick} class="quick-pick-button" disabled={isPlayDisabled  ||  selectedNumbers.length  ===  10}>  Quick  Pick </button>  
          </div>
      
           {#if  isMaxNumbersReached } 
               <p class="feedback-message"> You've reached the maximum selections (10)! </p>  
           {/if}
      
          {/* Result display  */} 
          {#if winningNumbers.length  >  0} 
            <div class="results-area">
                <h3> Round Results: </h3>  
      
                <div class="winning-numbers"> 
                   {#each winningNumbers as  winNumber }  
                       <span class="winning-number 
                                {selectedNumbers.includes(winNumber)  ?  'highlight'  :  ''}"> 
                           {winNumber}  
                       </span>  
                   {/each} 
                </div>
      
                 {#if payout > 0} 
                  <p> Congratulations!  You won  ${payout}!</p> 
                 {:else} 
                  <p> Better luck next time! </p>
                {/if}
           </div>
        {/if} 
      
      
        {#if showBonus} 
           <BonusGame 
               onClose={() => { showBonus =  false; payout = calculatePayout(
                   selectedNumbers.filter((num) => winningNumbers.includes(num)).length, 
                   betAmount,
                   bonusMultiplier
                   )}}
                on:multiplierchanged={(e)  => handleBonusMultiplierChange(e.detail)  } 
           /> 
       {/if}  
      
       </animated.div>  
      
      
       <style>  
       /* … add  your  CSS from the previous steps… */  
       </style>