<script> 
    import { createEventDispatcher } from 'svelte';  
    import { spring } from 'svelte/motion';
 
    export let  number; 
    export let isSelected  =  false;  
    export let  isWinningNumber  =  false;  
 
    const dispatch  =  createEventDispatcher();
    const springParams  =  spring(
       { 
           scale: isSelected  ?  1.2  :  1, 
           boxShadow: isSelected
             ? '0 0 20px 5px rgba(255, 255, 255, 0.8)' 
             : '0 0 10px 2px rgba(255, 255, 255, 0.5)',
       }, 
      {  stiffness:  200,  damping:  15  }); 
  
 
     function handleClick() {  
       dispatch('select',  {  number });  
     } 
  </script>  
  
     <div  class="crystal {isSelected ? 'selected' : ''} {isWinningNumber ? 'winning' : ''}" 
         style="transform: scale({$springParams.scale});  box-shadow:  {$springParams.boxShadow}"  on:click={handleClick} > 
         {number}  
     </div>
 
  <style>
     .crystal {
     width: 60px;
     height: 60px; 
     border-radius: 50%;  
     background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(128, 0, 128, 0.2), transparent);
     border: 2px solid white;
     color: white;  
     font-size:  20px; 
     display:  flex; 
     align-items: center; 
     justify-content:  center;  
     cursor:  pointer;  
     transition: all  0.2s ease-in-out;  
     }
 
  .crystal:hover { 
     transform: scale(1.1); 
     box-shadow: 0 0 10px 4px #a85cf9;  
  }  
 
   .crystal.winning {  
    background:  radial-gradient(circle,  rgba(218,165,32,1)  0%,  rgba(184,134,11,1)  100%);  
   } 
  </style> 