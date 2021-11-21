const addBtn = document.querySelector(".add-btn");
const modalContainer = document.querySelector(".modal-container");
const modalTextContainer = document.querySelector(".modal-text-container");
const blackModalElt = document.querySelector(".black.modal-priority-color");
const mainContainer = document.querySelector(".main-container");
const colors = ["light-orange", "light-green", "light-pink", "black"];
const modalPriorityColorElts = document.querySelectorAll(".modal-priority-color");
let modalPriorityColor="black";
let addFlag = false;
let removeFlag = false;
const lockClass = "fa-lock";
const unLockClass = "fa-lock-open";
let allTickets = document.querySelectorAll(".ticket-container");
const removeBtn = document.querySelector(".remove-btn");
const toolboxColors = document.querySelectorAll(".color");
let ticketObjArr = [];

if(localStorage.getItem("jira_tickets")){
  ticketObjArr = JSON.parse(localStorage.getItem("jira_tickets"));
  loadTickets(ticketObjArr);
}
function Ticket(id, task, color){
  this.id = id;
  this.color = color;
  this.task = task;
}


removeBtn.addEventListener("click", (e)=>{
  removeFlag = !removeFlag;
  if(removeFlag){
    removeBtn.classList.add("active");
    // allTickets.forEach((ticketElt, idx)=>{
    //   ticketElt.addEventListener("click", (e)=>{
    //     console.log("ticket fired");
    //     mainContainer.removeChild(ticketElt);
    //   });
    // });
  }else{
    removeBtn.classList.remove("active");
  }
})



// filtering 

toolboxColors.forEach((colorElt) =>{
  colorElt.addEventListener("click", (e) =>{
    // filtering
    let filterColor = colorElt.classList[1];
    let filteredTicketsArr = [];
    ticketObjArr.filter((ticketObj, idx) => {
      if(ticketObj.color == filterColor){
        filteredTicketsArr.push(ticketObj);
      }
    });
    // removing current existing tickets from display
    let allTicketsNode = document.querySelectorAll(".ticket-container");
    allTicketsNode.forEach((ticketNode =>{
      ticketNode.remove();
    }));
    // adding filtered tickets to display
    // console.log("all tickets length", ticketObjArr.length);
    // console.log(filteredTicketsArr.length);
    loadTickets(filteredTicketsArr);
  });

  colorElt.addEventListener("dblclick", (e) => {
    // fetch curr tasks on screen and remove them;
    console.log("reached in double click mode");
    let currTicketNodes = document.querySelectorAll(".ticket-container");
    currTicketNodes.forEach((ticketNode) =>{
      ticketNode.remove();
    });
    // feed all tickets to screen
    loadTickets(ticketObjArr);
  });
}); 


//event listener for setting priority color in modal
modalPriorityColorElts.forEach((colorElt,idx)=>{
  colorElt.addEventListener("click",(e)=>{
    let currColor = colorElt.classList[0];
    chooseModalPriorityModal(colorElt, currColor);
  });
});
// event listener for add button for ticket
addBtn.addEventListener("click",(e)=>{
  // display modal
  // generate ticket

  // toggle modal visibility on click on add btn
  // addFlag true  - Show modal
  // addFlag false -hide modal
  if(removeFlag){
    alert("delete mode is on, finish deletion first!");
    return;
  }
  addFlag = !addFlag
  if(addFlag){
    modalContainer.style.display = "flex";
  }else{
    modalContainer.style.display = "none";
  }
});

// generate ticket when shift click on modal
modalContainer.addEventListener("keydown",(e)=>{
  if(e.key == "Shift"){
    let taskText = modalTextContainer.value;
    let ticketId = generateUniqueId(8);
    let ticket = createTicket(modalPriorityColor,taskText, ticketId);
    mainContainer.appendChild(ticket);
    setModalToDefault();
    // console.log(ticket);
  }
});

function createTicket(ticketColor, ticketTask, ticketID){
  // console.log("reached here");
  let ticket = document.createElement("div");
  ticket.setAttribute("class", "ticket-container");
  ticket.innerHTML=`
  <div class="ticket-color ${ticketColor} "></div>
  <div class=" ticket-id">#${ticketID}</div>
  <div spellcheck="false" class="ticket-task">${ticketTask}</div>
  <div class="ticket-lock"><i class="fas fa-lock"></i></div>
  `;
  let exist = doesTicketObjExist(ticketID);
  // console.log(exist);
  if(exist==-1){
    // console.log(exist);
    let ticketObj = new Ticket(ticketID, ticketTask, ticketColor);
    ticketObjArr.push(ticketObj);
    console.log(ticketObjArr)
    updateLocalStorage(ticketObjArr);
  }
  // add event listener for removal at the start of creating ticket itself
  handleRemoval(ticket,ticketID);
  handleLock(ticket,ticketID);
  handleColor(ticket,ticketID);
  return ticket;
};


function generateUniqueId(length) {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for ( let i = 0; i < length; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

function setModalToDefault(){
    addFlag=!addFlag;
    modalTextContainer.value="";
    modalContainer.style.display = "none";
    chooseModalPriorityModal(blackModalElt, "black");
}

function chooseModalPriorityModal(targetElt, color){
  modalPriorityColorElts.forEach((elt)=>{
    elt.classList.remove("selected");
  });
  targetElt.classList.add("selected");
  modalPriorityColor = color;
}

function handleRemoval(ticket,id){
  ticket.addEventListener("click", (e) =>{
    if(removeFlag){
      let idx = doesTicketObjExist(id);
      ticketObjArr.splice(idx, 1);
      ticketsJson = JSON.stringify(ticketObjArr);
      localStorage.setItem("jira_tickets", ticketsJson);
      ticket.remove();
    }
  });
}

function handleLock(ticket, id){
  let lockElt = ticket.querySelector(".ticket-lock");
  let ticketLock = lockElt.children[0];
  ticketLock.addEventListener("click", (e) => {
    let ticketText = ticket.querySelector(".ticket-task");
  // to get the  i tag of icon
    // let idx = doesTicketObjExist(id);
    let currClass = ticketLock.classList[1];
    if(currClass == lockClass){
      ticketLock.classList.remove(lockClass);
      ticketLock.classList.add(unLockClass);
      ticketText.setAttribute("contenteditable","true");
      
    }else{
      ticketLock.classList.remove(unLockClass);
      ticketLock.classList.add(lockClass);
      ticketText.setAttribute("contenteditable","false");
    }
    let taskVal = ticketText.innerText;
    let idx = doesTicketObjExist(id);
    ticketObjArr[idx].task = taskVal;
    let ticketsJson = JSON.stringify(ticketObjArr);
    localStorage.setItem("jira_tickets", ticketsJson);
  });
}


function handleColor(ticket, id){
  // 1. get the color elt from ticket
  // 2. get current colr and its index in the colors array
  // 3. add click listener - on click move the add color class from next index in a circular fashion
  let colorElt = ticket.querySelector(".ticket-color");
  
  colorElt.addEventListener("click",(e) => {
    let currColor = colorElt.classList[1];
    let currIdx = colors.findIndex((color) =>{
    return color === currColor;
    });
    currIdx = (currIdx + 1)%(colors.length);
    colorElt.classList.remove(currColor);
    colorElt.classList.add(colors[currIdx]);
    let targetColor = colors[currIdx];
    let idx = doesTicketObjExist(id);
    console.log(idx);
    ticketObjArr[idx].color = targetColor;
    updateLocalStorage(ticketObjArr);
  });
}

function doesTicketObjExist(id){
  let i;
  for(i = 0 ; i < ticketObjArr.length; i++){
    let ticketObj = ticketObjArr[i];
    if(ticketObj.id == id)return i;
  }
  return -1;
}

function loadTickets(ticketObjArr){
  ticketObjArr.forEach((ticketObj) => {
    let ticket = createTicket(ticketObj.color, ticketObj.task, ticketObj.id);
    // console.log(ticket);
    mainContainer.appendChild(ticket);
  });
}

function updateLocalStorage(ticketObjArr){
  let ticketsJson = JSON.stringify(ticketObjArr);
  console.log(ticketsJson);
  localStorage.setItem("jira_tickets", ticketsJson);
}
