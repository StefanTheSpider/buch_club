import { useEffect, useState } from 'react';

const key = process.env.REACT_APP_API_KEY;

export default function Books() {
    const [search, setSearch] = useState('');
    const [books, setBooks] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [empty, setEmpty] = useState(true);

    useEffect(() => {
        async function getBooks() {
            if (search.trim() === '') {
                setBooks([]);
                return;
            }

            const controller = new AbortController();
            const signal = controller.signal;
            setLoading(true);
            setEmpty(false);

            try {
                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${search}&key=${key}&maxResults=40`,
                    { signal }
                );

                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await res.json();

                if (data.items && Array.isArray(data.items)) {
                    const books = data.items
                        .filter(
                            (item) => item.volumeInfo.imageLinks?.smallThumbnail
                        )
                        .filter((item) => item.volumeInfo.title)
                        .map((item) => ({
                            title: item.volumeInfo.title,
                            image: item.volumeInfo.imageLinks?.smallThumbnail,
                            description:
                                item.volumeInfo.description ||
                                'No description available',
                            price: item.saleInfo.retailPrice
                                ? `${item.saleInfo.retailPrice.amount} ${item.saleInfo.retailPrice.currencyCode}`
                                : 'Price not available',
                            pages: item.volumeInfo.pageCount,
                        }));
                    setBooks(books);
                } else {
                    setBooks([]);
                }
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error(e.message);
                }
            } finally {
                setLoading(false);
            }

            return () => controller.abort();
        }

        getBooks();
    }, [search]);

    const bookList = books.map((book, index) => (
        <Book
            key={index}
            title={book.title}
            image={book.image}
            price={book.price}
            pages={book.pages}
            description={book.description}
            isOpen={index === openIndex}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
        />
    ));

    return (
        <>
            <div className="navigations-leiste">
                <Logo />
                <input
                    className="suche"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for books"
                />
            </div>
            {empty && <Greatings />}
            {loading ? (
                <Loader />
            ) : (
                <div className="books-container">{bookList}</div>
            )}
        </>
    );
}

function Logo() {
    return <img className="logo" src="./gold_logo.png" alt="./gold_logo.png" />;
}

function Book({ title, image, pages, description, isOpen, onClick, price }) {
    return (
        <div className="book-item">
            {isOpen ? (
                <div className="show-details">
                    <p onClick={onClick} className="close-card">
                        X
                    </p>
                    <h4>{title}</h4>
                    <p>{description}</p>
                    <p>Seitenanzahl: {pages}</p>
                    <p>empfohlener Verkaufspreis: {price}</p>
                </div>
            ) : (
                <div className="book-title-img">
                    <img onClick={onClick} src={image} alt={title} />
                    <h4>{title}</h4>
                    <hr />
                </div>
            )}
        </div>
    );
}

function Loader() {
    return <div className="loader">Loading...</div>;
}

function Greatings() {
    return (
        <div className="gratings">
            <h1>Welcome to our Bookclub</h1>
            <p>Discover our wide selection of books at great prices.</p>
        </div>
    );
}
