import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';

function SearchPage() {
    // Task 1: State-Variablen definieren
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState(6);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(''); // NEU: State für die Kategorie
    const [selectedCondition, setSelectedCondition] = useState(''); // NEU: State für den Zustand

    const navigate = useNavigate();

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    // Lädt initial alle Produkte. Das ist in Ordnung für eine kleine Datenmenge.
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = `${urlConfig.backendUrl}/api/gifts`;
                console.log("Fetching all gifts from:", url);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`);
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);

    // Task 2: Suchergebnisse basierend auf den Filtern von der API abrufen
    const handleSearch = async () => {
        const baseUrl = `${urlConfig.backendUrl}/api/search`;
        const params = new URLSearchParams();

        // GEÄNDERT: Parameter nur hinzufügen, wenn sie einen Wert haben.
        // Liest Werte aus dem State statt direkt aus dem DOM.
        if (searchQuery) params.append('name', searchQuery);
        if (ageRange) params.append('age_years', ageRange);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedCondition) params.append('condition', selectedCondition);

        const queryParams = params.toString();
        const searchUrl = `${baseUrl}?${queryParams}`;

        try {
            console.log("Searching with URL:", searchUrl);
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`Search failed with status: ${response.status}`);
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Failed to fetch search results:', error);
            // Optional: Dem Benutzer eine Fehlermeldung anzeigen
            setSearchResults([]); // Suchergebnisse bei Fehler leeren
        }
    };

    // Task 6: Zur Detailseite navigieren
    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>

                        {/* Task 7: Texteingabefeld (war bereits korrekt) */}
                        <div className="form-group my-2">
                            <label htmlFor="searchInput">Search by Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="searchInput"
                                placeholder="Enter gift name"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Task 3: Dropdowns (jetzt als Controlled Components) */}
                        <div className="form-group my-2">
                            <label htmlFor="categorySelect">Category</label>
                            <select
                                id="categorySelect"
                                className="form-control"
                                value={selectedCategory} // GEÄNDERT
                                onChange={e => setSelectedCategory(e.target.value)} // GEÄNDERT
                            >
                                <option value="">All</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group my-2">
                            <label htmlFor="conditionSelect">Condition</label>
                            <select
                                id="conditionSelect"
                                className="form-control"
                                value={selectedCondition} // GEÄNDERT
                                onChange={e => setSelectedCondition(e.target.value)} // GEÄNDERT
                            >
                                <option value="">All</option>
                                {conditions.map(condition => (
                                    <option key={condition} value={condition}>{condition}</option>
                                ))}
                            </select>
                        </div>

                        {/* Task 4: Schieberegler (war bereits korrekt) */}
                        <div className="form-group my-2">
                            <label htmlFor="ageRange">Less than {ageRange} years</label>
                            <input
                                type="range"
                                className="form-control-range w-100"
                                id="ageRange"
                                min="1"
                                max="10"
                                value={ageRange}
                                onChange={e => setAgeRange(e.target.value)}
                            />
                        </div>

                        {/* Task 8: Such-Button (war bereits korrekt) */}
                        <button onClick={handleSearch} className="btn btn-primary w-100 mt-3">
                            Search
                        </button>
                    </div>

                    {/* Task 5: Suchergebnisse anzeigen */}
                    <div className="search-results mt-4">
                        {searchResults.length > 0 ? (
                            searchResults.map(product => (
                                <div key={product.id} className="card mb-3" onClick={() => goToDetailsPage(product.id)} style={{ cursor: 'pointer' }}>
                                    <img src={product.image} alt={product.name} className="card-img-top" />
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text">{product.description.slice(0, 100)}...</p>
                                    </div>
                                    <div className="card-footer">
                                        {/* Der Button kann bleiben, aber die ganze Karte klickbar zu machen ist oft nutzerfreundlicher */}
                                        <small className="text-muted">Click to view more</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="alert alert-info" role="alert">
                                No products found. Please revise your filters or wait for the initial list to load.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;