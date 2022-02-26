function doConfirm(msg, yesFn, noFn) {
      let alertCreate = document.getElementById('root');
    let alertContent = `
      <div id="customBox">
        <div class="message">${msg}</div>
        <span class="yes" id="yes">Yes</span>
        <span class="no" id="no">No</span>
      </div>`;
     
     alertCreate.insertAdjacentHTML('afterend', alertContent );
     let customBox = document.getElementById("customBox");
    
     document.addEventListener('click', function (event) {
          if (!event.target.matches('.yes, .no')) return;
          event.preventDefault(); // Don't follow the link
          let evt = event.target.id;
          if(evt=="yes") { yesFn() }
          else { noFn() }
          customBox.remove()
      }, false);
    
  }  

export default doConfirm;

