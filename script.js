const booksContainer = document.getElementById("books-container");
const searchInput = document.getElementById("search-input");
const searchIdButton = document.getElementById("search-id-button");
const searchNameButton = document.getElementById("search-name-button");
const searchAuthorButton = document.getElementById("search-author-button");
const searchYearButton = document.getElementById("search-year-button");
const deleteBookButton = document.getElementById("delete-book-button");
const deleteModal = document.getElementById("delete-modal");
const deleteForm = document.getElementById("delete-form");
const deleteCloseButton = document.querySelector(".delete-close");

let books = [];

function displayBooks(bookList) {
    booksContainer.innerHTML = "";
    bookList.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        const imageElement = document.createElement("img");
        imageElement.src = book.image;
        imageElement.alt = book.title;
        imageElement.classList.add("book-image");

        const titleHeading = document.createElement("h2");
        titleHeading.textContent = book.title;

        const idParagraph = document.createElement("p");
        idParagraph.innerHTML = `<strong>ID:</strong> ${book.id}`;

        const authorParagraph = document.createElement("p");
        authorParagraph.innerHTML = `<strong>Author:</strong> ${book.author}`;

        const genreParagraph = document.createElement("p");
        genreParagraph.innerHTML = `<strong>Genre:</strong> ${book.genre}`;

        const yearParagraph = document.createElement("p");
        yearParagraph.innerHTML = `<strong>Year:</strong> ${book.year}`;

        bookDiv.appendChild(imageElement);
        bookDiv.appendChild(titleHeading);
        bookDiv.appendChild(idParagraph);
        bookDiv.appendChild(authorParagraph);
        bookDiv.appendChild(genreParagraph);
        bookDiv.appendChild(yearParagraph);

        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.classList.add("update-button");
        updateButton.addEventListener("click", () => openEditModal(book));

        bookDiv.appendChild(updateButton);
        booksContainer.appendChild(bookDiv);
    });
}

function searchBooks(searchTerm, searchType) {
    fetch('http://localhost:3000/books')
        .then(response => response.json())
        .then(data => {
            books = data;
            const searchTermLower = searchTerm.toLowerCase();
            const filteredBooks = books.filter(book => {
                if (searchType === "id") {
                    return book.id === parseInt(searchTerm);
                } else if (searchType === "name") {
                    return book.title.toLowerCase().includes(searchTermLower);
                } else if (searchType === "author") {
                    return book.author.toLowerCase().includes(searchTermLower);
                } else if (searchType === "year") {
                    return book.year === parseInt(searchTerm);
                }
                return false;
            });

            if (filteredBooks.length > 0) {
                displayBooks(filteredBooks);
            } else {
                booksContainer.innerHTML = "<p>No books found.</p>";
            }
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            booksContainer.innerHTML = '<p>Error loading books.</p>';
        });
}

function fetchBooks() {
    fetch('http://localhost:3000/books')
        .then(response => response.json())
        .then(data => {
            books = data;
            displayBooks(books);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            booksContainer.innerHTML = '<p>Error loading books.</p>';
        });
}

fetchBooks();

searchIdButton.addEventListener("click", () => {
    searchBooks(searchInput.value, "id");
});

searchNameButton.addEventListener("click", () => {
    searchBooks(searchInput.value, "name");
});

searchAuthorButton.addEventListener("click", () => {
    searchBooks(searchInput.value, "author");
});

searchYearButton.addEventListener("click", () => {
    searchBooks(searchInput.value, "year");
});

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const closeButton = document.querySelector(".close");

function openEditModal(book) {
    editModal.style.display = "block";
    document.getElementById("edit-id").value = book.id;
    document.getElementById("edit-title").value = book.title;
    document.getElementById("edit-author").value = book.author;
    document.getElementById("edit-genre").value = book.genre;
    document.getElementById("edit-year").value = book.year;
    document.getElementById("edit-image").value = book.image;
}

closeButton.onclick = function() {
    editModal.style.display = "none";
};

window.onclick = function(event) {
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
};

editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedBook = {
        id: parseInt(document.getElementById("edit-id").value),
        title: document.getElementById("edit-title").value,
        author: document.getElementById("edit-author").value,
        genre: document.getElementById("edit-genre").value,
        year: parseInt(document.getElementById("edit-year").value),
        image: document.getElementById("edit-image").value
    };
    updateBookInJson(updatedBook);
});

function updateBookInJson(updatedBook) {
    fetch('http://localhost:3000/books')
        .then(response => response.json())
        .then(data => {
            const index = data.findIndex(book => book.id === updatedBook.id);
            if (index !== -1) {
                data[index] = updatedBook;
                fetch('http://localhost:3000/books', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                    .then(() => {
                        fetchBooks();
                        editModal.style.display = 'none';
                    })
                    .catch(error => console.error('Error updating JSON:', error));
            }
        });
}

const addBookButton = document.getElementById("add-book-button");
const addModal = document.getElementById("add-modal");
const addForm = document.getElementById("add-form");
const addCloseButton = document.querySelector(".add-close");

addBookButton.addEventListener("click", () => {
    addModal.style.display = "block";
});

addCloseButton.onclick = () => {
    addModal.style.display = "none";
};

addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newBook = {
        title: document.getElementById("add-title").value,
        author: document.getElementById("add-author").value,
        genre: document.getElementById("add-genre").value,
        year: parseInt(document.getElementById("add-year").value),
        image: document.getElementById("add-image").value
    };
    addNewBook(newBook);
});

function addNewBook(newBook) {
    fetch('http://localhost:3000/books')
        .then(response => response.json())
        .then(data => {
            const maxId = data.reduce((max, book) => Math.max(max, book.id), 0);
            newBook.id = maxId + 1;
            data.push(newBook);
            fetch('http://localhost:3000/books', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(() => {
                    fetchBooks();
                    addModal.style.display = 'none';
                    addForm.reset();
                })
                .catch(error => console.error('Error adding book:', error));
        });
}

deleteBookButton.addEventListener("click", () => {
    const bookName = prompt("Enter the name of the book you want to delete:");
    if (bookName) {
        fetch('http://localhost:3000/books')
            .then(response => response.json())
            .then(data => {
                const book = data.find(b => b.title.toLowerCase() === bookName.toLowerCase());
                if (book) {
                    document.getElementById("delete-title").textContent = book.title;
                    document.getElementById("delete-author").textContent = book.author;
                    document.getElementById("delete-year").textContent = book.year;
                    document.getElementById("delete-id").value = book.id;
                    deleteModal.style.display = "block";
                } else {
                    alert("Book not found.");
                }
            })
            .catch(error => console.error('Error fetching books:', error));
    }
});

deleteCloseButton.onclick = () => {
    deleteModal.style.display = "none";
};

deleteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const bookId = parseInt(document.getElementById("delete-id").value);
    deleteBook(bookId);
});

function deleteBook(bookId) {
    fetch('http://localhost:3000/books')
        .then(response => response.json())
        .then(data => {
            const updatedBooks = data.filter(book => book.id !== bookId);
            fetch('http://localhost:3000/books', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBooks),
            })
                .then(() => {
                    fetchBooks();
                    deleteModal.style.display = 'none';
                    deleteForm.reset();
                })
                .catch(error => console.error('Error deleting book:', error));
        });
}