// Properties page specific functionality
class PropertiesManager {
    constructor() {
        this.currentPage = 1;
        this.propertiesPerPage = 12;
        this.filters = {
            completion: 'any',
            propertyTypes: [],
            priceMin: 200000,
            priceMax: 50000000,
            bedrooms: 'any',
            bathrooms: 'any',
            areaMin: null,
            areaMax: null,
            amenities: []
        };
        
        this.mockProperties = this.generateMockProperties();
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupViewControls();
        this.setupSorting();
        this.renderProperties();
        this.setupPagination();
    }

    generateMockProperties() {
        const properties = [];
        const locations = [
            'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay',
            'Dubai Hills', 'JVC', 'Arabian Ranches', 'The Greens', 'JBR', 'DIFC'
        ];
        
        const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio'];
        const amenities = ['Balcony', 'Built-in Kitchen', 'Central A/C', 'Shared Pool', 'Shared Gym', 'Parking'];
        
        for (let i = 0; i < 100; i++) {
            const bedrooms = Math.floor(Math.random() * 6) + 1;
            const bathrooms = Math.floor(Math.random() * 4) + 1;
            const area = Math.floor(Math.random() * 4000) + 500;
            const price = Math.floor(Math.random() * 10000000) + 500000;
            
            properties.push({
                id: i + 1,
                title: `Luxury ${propertyTypes[Math.floor(Math.random() * propertyTypes.length)]}`,
                location: locations[Math.floor(Math.random() * locations.length)],
                type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
                price: price,
                bedrooms: bedrooms === 1 && Math.random() > 0.8 ? 'Studio' : bedrooms,
                bathrooms: bathrooms,
                area: area,
                completion: Math.random() > 0.7 ? 'off-plan' : 'completed',
                amenities: amenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
                image: `https://images.pexels.com/photos/${1029599 + (i % 20)}/pexels-photo-${1029599 + (i % 20)}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`,
                gallery: Math.floor(Math.random() * 20) + 5,
                featured: Math.random() > 0.8,
                dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }
        
        return properties.sort((a, b) => b.dateAdded - a.dateAdded);
    }

    setupFilters() {
        // Completion status
        document.querySelectorAll('input[name="completion"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.filters.completion = e.target.value;
                this.applyFilters();
            });
        });

        // Property types
        document.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const value = e.target.value;
                if (e.target.checked) {
                    if (!this.filters.propertyTypes.includes(value)) {
                        this.filters.propertyTypes.push(value);
                    }
                } else {
                    this.filters.propertyTypes = this.filters.propertyTypes.filter(type => type !== value);
                }
                this.applyFilters();
            });
        });

        // Price range
        const priceInputs = document.querySelectorAll('.price-input');
        priceInputs.forEach(input => {
            input.addEventListener('input', () => {
                const minInput = document.getElementById('min-price');
                const maxInput = document.getElementById('max-price');
                
                if (minInput.value) this.filters.priceMin = parseInt(minInput.value);
                if (maxInput.value) this.filters.priceMax = parseInt(maxInput.value);
                
                this.applyFilters();
            });
        });

        // Clear filters
        document.querySelector('.btn-clear-filters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });
    }

    setupViewControls() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                
                // Update active state
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update grid layout
                const grid = document.getElementById('properties-grid');
                grid.className = `properties-grid view-${view}`;
            });
        });
    }

    setupSorting() {
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProperties(e.target.value);
                this.renderProperties();
            });
        }
    }

    applyFilters() {
        let filtered = [...this.mockProperties];

        // Filter by completion status
        if (this.filters.completion !== 'any') {
            filtered = filtered.filter(prop => prop.completion === this.filters.completion);
        }

        // Filter by property types
        if (this.filters.propertyTypes.length > 0) {
            filtered = filtered.filter(prop => 
                this.filters.propertyTypes.some(type => 
                    prop.type.toLowerCase().includes(type.toLowerCase())
                )
            );
        }

        // Filter by price range
        filtered = filtered.filter(prop => 
            prop.price >= this.filters.priceMin && prop.price <= this.filters.priceMax
        );

        this.filteredProperties = filtered;
        this.currentPage = 1;
        this.updateResultsCount();
        this.renderProperties();
        this.updatePagination();
    }

    sortProperties(sortBy) {
        if (!this.filteredProperties) this.filteredProperties = [...this.mockProperties];
        
        switch (sortBy) {
            case 'newest':
                this.filteredProperties.sort((a, b) => b.dateAdded - a.dateAdded);
                break;
            case 'price-low':
                this.filteredProperties.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProperties.sort((a, b) => b.price - a.price);
                break;
            case 'area':
                this.filteredProperties.sort((a, b) => b.area - a.area);
                break;
        }
    }

    renderProperties() {
        const grid = document.getElementById('properties-grid');
        if (!grid) return;

        const properties = this.filteredProperties || this.mockProperties;
        const startIndex = (this.currentPage - 1) * this.propertiesPerPage;
        const endIndex = startIndex + this.propertiesPerPage;
        const currentProperties = properties.slice(startIndex, endIndex);

        grid.innerHTML = '';

        currentProperties.forEach((property, index) => {
            const propertyCard = this.createPropertyCard(property);
            grid.appendChild(propertyCard);

            // Add valuation CTA after every 6 properties
            if ((index + 1) % 6 === 0) {
                const valuationCTA = this.createValuationCTA();
                grid.appendChild(valuationCTA);
            }
        });
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card';
        
        const bedroomsDisplay = property.bedrooms === 'Studio' ? 'Studio' : `${property.bedrooms} bed`;
        const bathroomsDisplay = property.bedrooms === 'Studio' ? '' : `${property.bathrooms} bath`;
        
        card.innerHTML = `
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}" loading="lazy">
                ${property.featured ? '<div class="property-badge">Featured</div>' : ''}
                <button class="property-favorite" onclick="this.classList.toggle('active')" aria-label="Add to favorites">
                    ❤️
                </button>
                <div class="gallery-indicator">📷 ${property.gallery}</div>
            </div>
            <div class="property-content">
                <div class="property-price">${this.formatPrice(property.price)}</div>
                <div class="property-location">📍 ${property.location}</div>
                <div class="property-specs">
                    <div class="spec-item">
                        <span class="spec-icon">🛏️</span>
                        <span>${bedroomsDisplay}</span>
                    </div>
                    ${bathroomsDisplay ? `
                    <div class="spec-item">
                        <span class="spec-icon">🚿</span>
                        <span>${bathroomsDisplay}</span>
                    </div>
                    ` : ''}
                    <div class="spec-item">
                        <span class="spec-icon">📐</span>
                        <span>${this.formatArea(property.area)}</span>
                    </div>
                </div>
                <div class="property-amenities">
                    <div class="amenities-list">
                        ${property.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                    </div>
                </div>
                <div class="property-actions">
                    <button class="btn-view-details" onclick="this.viewPropertyDetails(${property.id})">
                        View Details
                    </button>
                    <button class="btn-whatsapp" onclick="McConeApp.openWhatsApp('971543806683', 'Hi, I\'m interested in property ${property.id}')" aria-label="WhatsApp">
                        💬
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    createValuationCTA() {
        const cta = document.createElement('div');
        cta.className = 'valuation-cta grid-full-width';
        cta.innerHTML = `
            <div class="valuation-content">
                <h3>Get in touch and we'll help assess your property's value</h3>
                <p>Free professional valuation for your Dubai property</p>
                <a href="book-valuation.html" class="btn-primary">Get Free Valuation</a>
            </div>
        `;
        return cta;
    }

    updateResultsCount() {
        const count = this.filteredProperties ? this.filteredProperties.length : this.mockProperties.length;
        const resultsElement = document.getElementById('results-count');
        if (resultsElement) {
            resultsElement.textContent = `${count.toLocaleString()} Properties Found`;
        }
    }

    clearAllFilters() {
        // Reset filter object
        this.filters = {
            completion: 'any',
            propertyTypes: [],
            priceMin: 200000,
            priceMax: 50000000,
            bedrooms: 'any',
            bathrooms: 'any',
            areaMin: null,
            areaMax: null,
            amenities: []
        };

        // Reset form elements
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === 'any';
        });

        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelectorAll('.price-input, .area-input').forEach(input => {
            input.value = '';
        });

        // Apply filters
        this.applyFilters();
    }

    setupPagination() {
        document.querySelectorAll('.pagination-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.textContent);
                this.goToPage(page);
            });
        });

        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = btn.textContent.toLowerCase();
                if (direction.includes('next')) {
                    this.goToPage(this.currentPage + 1);
                } else if (direction.includes('previous')) {
                    this.goToPage(this.currentPage - 1);
                }
            });
        });
    }

    goToPage(page) {
        const totalProperties = this.filteredProperties ? this.filteredProperties.length : this.mockProperties.length;
        const totalPages = Math.ceil(totalProperties / this.propertiesPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderProperties();
        this.updatePagination();
        
        // Scroll to top of results
        document.querySelector('.properties-content').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    updatePagination() {
        const totalProperties = this.filteredProperties ? this.filteredProperties.length : this.mockProperties.length;
        const totalPages = Math.ceil(totalProperties / this.propertiesPerPage);
        
        // Update pagination numbers
        document.querySelectorAll('.pagination-number').forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === this.currentPage);
        });
        
        // Update prev/next buttons
        const prevBtn = document.querySelector('.pagination-btn');
        const nextBtn = document.querySelectorAll('.pagination-btn')[1];
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    }

    viewPropertyDetails(propertyId) {
        // In a real application, this would navigate to property detail page
        window.location.href = `property-details.html?id=${propertyId}`;
    }

    formatPrice(price) {
        if (price >= 1000000) {
            return `AED ${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `AED ${(price / 1000).toFixed(0)}K`;
        }
        return `AED ${price.toLocaleString()}`;
    }

    formatArea(area) {
        return `${area.toLocaleString()} sqft`;
    }
}

// Stepper functionality
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.stepper').forEach(stepper => {
        const minusBtn = stepper.querySelector('.stepper-btn:first-child');
        const plusBtn = stepper.querySelector('.stepper-btn:last-child');
        const value = stepper.querySelector('.stepper-value');
        
        let currentValue = 0; // 0 means "Any"
        
        const updateDisplay = () => {
            if (currentValue === 0) {
                value.textContent = 'Any';
            } else if (currentValue >= 7) {
                value.textContent = '7+';
            } else {
                value.textContent = currentValue.toString();
            }
        };
        
        minusBtn.addEventListener('click', () => {
            if (currentValue > 0) {
                currentValue--;
                updateDisplay();
            }
        });
        
        plusBtn.addEventListener('click', () => {
            if (currentValue < 7) {
                currentValue++;
                updateDisplay();
            }
        });
    });
});

// Amenities modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const viewAllBtn = document.querySelector('.view-all-amenities');
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            showAmenitiesModal();
        });
    }
});

function showAmenitiesModal() {
    const allAmenities = [
        { value: 'balcony', icon: '🏢', label: 'Balcony' },
        { value: 'kitchen', icon: '🍳', label: 'Built-in Kitchen' },
        { value: 'wardrobes', icon: '👔', label: 'Built-in Wardrobes' },
        { value: 'ac', icon: '❄️', label: 'Central A/C' },
        { value: 'concierge', icon: '🛎️', label: 'Concierge Service' },
        { value: 'parking', icon: '🚗', label: 'Covered Parking' },
        { value: 'maid-service', icon: '🧹', label: 'Maid Service' },
        { value: 'maids-room', icon: '🏠', label: 'Maids Room' },
        { value: 'pets', icon: '🐕', label: 'Pets Allowed' },
        { value: 'garden', icon: '🌳', label: 'Private Garden' },
        { value: 'private-gym', icon: '💪', label: 'Private Gym' },
        { value: 'jacuzzi', icon: '🛁', label: 'Private Jacuzzi' },
        { value: 'private-pool', icon: '🏊', label: 'Private Pool' },
        { value: 'security', icon: '🛡️', label: 'Security' },
        { value: 'shared-gym', icon: '🏋️', label: 'Shared Gym' },
        { value: 'shared-pool', icon: '🏊‍♀️', label: 'Shared Pool' },
        { value: 'spa', icon: '🧖', label: 'Shared Spa' },
        { value: 'study', icon: '📚', label: 'Study' },
        { value: 'landmark-view', icon: '🏙️', label: 'View of Landmark' },
        { value: 'water-view', icon: '🌊', label: 'View of Water' },
        { value: 'walk-in-closet', icon: '👗', label: 'Walk-in Closet' }
    ];

    const modal = document.createElement('div');
    modal.className = 'amenities-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>All Amenities</h3>
                <button class="modal-close" onclick="this.closest('.amenities-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="amenities-modal-grid">
                    ${allAmenities.map(amenity => `
                        <label class="amenity-option">
                            <input type="checkbox" value="${amenity.value}">
                            <span class="amenity-custom"></span>
                            <span class="amenity-icon">${amenity.icon}</span>
                            ${amenity.label}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.amenities-modal').remove()">Cancel</button>
                <button class="btn-primary" onclick="applyAmenitiesFilter(this)">Apply Filters</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 10);
}

function applyAmenitiesFilter(btn) {
    const modal = btn.closest('.amenities-modal');
    const checkedAmenities = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
        .map(input => input.value);
    
    // Update main amenities display
    const mainAmenitiesGrid = document.querySelector('.amenities-grid');
    if (mainAmenitiesGrid) {
        checkedAmenities.forEach(amenity => {
            const checkbox = mainAmenitiesGrid.querySelector(`input[value="${amenity}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    modal.remove();
}

// Initialize properties manager
document.addEventListener('DOMContentLoaded', () => {
    window.PropertiesManager = new PropertiesManager();
});

// Additional modal styles
const modalStyles = `
.amenities-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.amenities-modal.show {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid var(--gray-200);
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--gray-500);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: var(--gray-100);
    color: var(--gray-700);
}

.modal-body {
    padding: 24px;
    max-height: 400px;
    overflow-y: auto;
}

.amenities-modal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}

.modal-footer {
    padding: 24px;
    border-top: 1px solid var(--gray-200);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.grid-full-width {
    grid-column: 1 / -1;
}
`;

const modalStyleSheet = document.createElement('style');
modalStyleSheet.textContent = modalStyles;
document.head.appendChild(modalStyleSheet);