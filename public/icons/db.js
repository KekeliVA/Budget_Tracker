let db;
// creating a new db request for the "budget" database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // creating an object store referred to as "pending" to set autoIncrement to true 
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // creates a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access the pending object store
  const store = transaction.objectStore("pending");

  // use the add method on store to add a record
  store.add(record);
}

function checkDatabase() {
  // open a transaction on the pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access the pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable called getAll
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // On success, open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");

        // access the pending object store
        const store = transaction.objectStore("pending");

        // clearing all items in the store
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
