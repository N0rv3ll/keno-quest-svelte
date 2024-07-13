<script>
    import { spring } from "svelte/motion";
    import { createEventDispatcher } from 'svelte';
    
     export let onClose; 
    
    const dispatch = createEventDispatcher();
    
      let selectedGem =  null; 
    
     const  gems = [
         { id:  1,  color:  'red',  multiplier: 2 },
         { id:  2, color:  'blue', multiplier:  3  },
         { id:  3,  color:  'green',  multiplier:  5 },
     ];  
    
      const  handleGemClick  = (gem) => {  
         // update state to give user feedback by highlighting gem
         selectedGem =  gem.id;
    
         dispatch('multiplierchanged', gem.multiplier); 
    
         setTimeout(onClose,  3000);  // Close after delay  
     };  
    
     // Animation
    const modalSpring  = spring({ 
        opacity:  1, 
        scale:  1, 
        from:  {  opacity:  0,  scale:  0.8 }  });  
    
    </script>
    
    
    <div  class="bonus-modal" style="{$modalSpring}" >  
      <h2 class="bonus-header"> Gemstone Gambit!  </h2>  
      <p class="bonus-prompt">  Choose a gemstone wisely…  </p>  
    
       <div class="gems-container"> 
          {#each  gems  as  gem (gem.id) }  
               <div  
                   on:click={ ()  =>  handleGemClick(gem)  } 
                   class="gem  {gem.id === selectedGem  ?  'selected-gem'  : '' }"  style="background-color:{gem.color}" 
                   >
                {#if gem.id ===  selectedGem}  
                   <p>{gem.multiplier}x</p>  
                {/if} 
              </div>
         {/each}  
      </div>
    
      {#if  selectedGem} 
       <button  class="close-button" on:click={onClose} >  Collect </button>  
     {/if}
    
    </div>  
    
    <style>
    .bonus-modal {
        position: fixed; /* Ensure the modal covers the whole viewport */ 
        top:  0;
        left:  0;
        right: 0;
        bottom: 0;
        background-color:  rgba(0,  0, 0,  0.7);  
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;  
        z-index:  10; 
    }
    
     .bonus-header {  
         color:  white;  
         margin-bottom:  20px; 
     }  
    
      .bonus-prompt  {  
           color:  #ccc; 
           margin-bottom:  30px;  
      }  
    
      .gems-container {
        display:  flex;
        gap:  20px;
      }
    
    .gem  {
       width: 80px;
       height:  80px;
       border-radius: 50%; 
       border:  3px  solid  white; 
       display: flex;
       justify-content: center;
       align-items: center;
       font-size: 1.5em;
       color: white;
       transition: transform 0.2s ease,  box-shadow  0.2s  ease; 
       cursor:  pointer;
    }
    
    .gem:hover {
      transform: scale(1.2); 
      box-shadow:  0px  0px  20px  white; 
    } 
    
     .selected-gem {  
         border-color:  gold;  
    }
    
    .close-button { 
      background-color:  #4caf50; 
      border:  none; 
      color:  white;
      padding:  10px 20px;  
      text-align:  center;  
      text-decoration:  none; 
      display:  inline-block;  
      font-size:  16px;  
      margin:  4px  2px;  
      cursor: pointer; 
      border-radius:  5px;  
    } 
    </style>