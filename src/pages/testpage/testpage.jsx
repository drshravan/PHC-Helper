import { useState } from "react";

export default function TestPage() {
    const [items, setItems] = useState(["Item 1", "Item 2", "Item 3"]);

    const handleAddItem = () => {
        setItems([...items, `Item ${items.length + 1}`]);
    };

    return (
        <div
            style={{
                height: "80vh",
                width: "60vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "20px",
                padding: "20px",
                border: "2px solid #ccc",
                borderRadius: "10px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    color: "green",
                    backgroundColor: "lightgray",
                    padding: "10px",
                    borderRadius: "50px",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: "bold",
                    fontSize: "24px",
                }}
            >
                This is a test page
            </h1>
            <p
                style={{
                    color: "blue",
                }}
            >
                Welcome to the test page. This is a simple example to demonstrate a
                React component.
            </p>

            <button
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "#28a745",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#218838")
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#28a745")
                }
                onClick={handleAddItem}
            >
                Add Item
            </button>

            <ul
                style={{
                    listStyleType: "circle",
                    padding: "10px",
                    margin: "0",
                    color: "#333",
                    fontFamily: "Verdana, sans-serif",
                    fontSize: "18px",
                }}
            >
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}