const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path'); // Add this line
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './'))); // Serve static files from the current directory

app.get('/books', async (req, res) => {
    try {
        const data = await fs.readFile('books.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Error reading books.json:", err);
        res.status(500).send('Error reading books');
    }
});

app.put('/books', async (req, res) => {
    try {
        await fs.writeFile('books.json', JSON.stringify(req.body, null, 2));
        res.send('Books updated successfully');
    } catch (err) {
        console.error("Error writing to books.json:", err);
        res.status(500).send('Error updating books');
    }
});

app.post('/books', async (req, res) => {
    try {
        const newBook = req.body;
        const data = await fs.readFile('books.json', 'utf8');
        const books = JSON.parse(data);

        const maxId = books.reduce((max, book) => Math.max(max, book.id), 0);
        newBook.id = maxId + 1;

        books.push(newBook);
        await fs.writeFile('books.json', JSON.stringify(books, null, 2));
        res.status(201).send('Book added successfully');
    } catch (err) {
        console.error("Error adding book:", err);
        res.status(500).send('Error adding book');
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const data = await fs.readFile('books.json', 'utf8');
        const books = JSON.parse(data);
        const updatedBooks = books.filter(book => book.id !== bookId);

        if (books.length === updatedBooks.length) {
            return res.status(404).send('Book not found');
        }

        await fs.writeFile('books.json', JSON.stringify(updatedBooks, null, 2));
        res.send('Book deleted successfully');
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send('Error deleting book');
    }
});

try {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
} catch (error) {
    console.log("Error starting server:", error);
}