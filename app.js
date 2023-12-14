
const sidebar = document.getElementById('sidebarId');
const sidebarBefore = document.getElementById('sidebar-before');
const arowLeft = document.getElementById('arow-left');
const ilSecimi = document.getElementById('ilSecimi');
const ilceSecimi = document.getElementById('ilceSecimi');
let takipNoInput = document.getElementById('takip_no');
let toplamKm = document.getElementById('toplam_km');
let siparislerData = [];
let rotalarData = [];

sidebarBefore.addEventListener('click', () => {
        const isOpen = sidebar.style.right === '0px';
        sidebar.style.right = isOpen ? '-650px' : '0';
        arowLeft.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        arowLeft.style.transition = 'transform 0.9s ease';
    });

const dataSiparisler = async () => {
    try {
        const response = await fetch("siparisler.json");
        const data = await response.json();

        addSiparisToMap(data.data);
        siparislerData = data.data;
    } catch (error) {
        console.error('Siparişleri alma hatası:', error);
    }
};

const dataSiparislerCity = async () => {
    try {
        const response = await fetch("siparisler.json");
        const data = await response.json();

        const allCities = data.data.map(siparis => siparis.city_name);
        const allDistricts = data.data.map(siparis => siparis.district_name);

        const uniqueCities = [...new Set(allCities)];
        const uniqueDistricts = [...new Set(allDistricts)];

        addCitysToSelect(uniqueCities);
        addDistrictsToSelect(uniqueDistricts);
    } catch (error) {
        console.error(error);
    }
};

const addCitysToSelect = (cities) => {
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        ilSecimi.appendChild(option);
    });
};

const addDistrictsToSelect = (districts) => {
    for (const district of districts) {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        ilceSecimi.appendChild(option);
    }
};

ilSecimi.addEventListener('change', () => {
    const selectedCity = ilSecimi.value;
    showSelectedCityPoints(selectedCity);
    updateIlceSelect(selectedCity);
});

const showSelectedDistrictPoints = () => {
    clearMap();
    clearMapRoutes();
    const selectedDistricts = Array.from(ilceSecimi.selectedOptions).map(option => option.value);
    if (selectedDistricts.length === 0) {

        const selectedCity = ilSecimi.value;
        const filteredSiparisler = siparislerData.filter(siparis => siparis.city_name === selectedCity);
        addSiparisToMap(filteredSiparisler);

    } else {
        selectedDistricts.forEach(selectedDistrict => {
            const filteredSiparisler = siparislerData.filter(siparis => siparis.district_name === selectedDistrict);
            addSiparisToMap(filteredSiparisler);

            filteredSiparisler.forEach(siparis => {
                const matchingRoute = rotalarData.find(route => route.route_id === siparis.route_id);
                if (matchingRoute) {
                    const routeColor = matchingRoute.route_color || 'blue';
                    const polyline = L.polyline(matchingRoute.path, { color: routeColor });
                    polyline.addTo(map);
                }
            })
        });
    }
};

const updateIlceSelect = (selectedCity) => {
    ilceSecimi.innerHTML = '';
    const filteredSiparisler = siparislerData.filter(siparis => siparis.city_name === selectedCity);
    const uniqueDistricts = [...new Set(filteredSiparisler.map(siparis => siparis.district_name))];
    uniqueDistricts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        ilceSecimi.appendChild(option);
    });
};

const showSelectedCityPoints = (selectedCity) => {
    clearMap();
    const filteredSiparisler = siparislerData.filter(siparis => siparis.city_name === selectedCity);
    addSiparisToMap(filteredSiparisler);
};

const searchByCustomerName = (event) => {
    clearMap();
    clearMapRoutes();
    const searchText = event.target.value.toLowerCase();
    const filteredSiparisler = siparislerData.filter(siparis =>
        siparis.customer_no.toLowerCase().includes(searchText)
    );

    addSiparisToMap(filteredSiparisler);
};

const searchByOrderNoInput = (event) => {
    if (event.target.value === "") {
        addSiparisToMap(siparislerData);
    }
}

const handleEnter = (event) => {
    if (event.key === "Enter") {
        searchByOrderNo();
    }
};

const searchByOrderNo = () => {
    
    let searchOrderNo = takipNoInput.value.trim();

    if (searchOrderNo === "") {

        addSiparisToMap(siparislerData);
    }

    const filteredSiparisler = siparislerData.filter(siparis => siparis.order_no === searchOrderNo);

    if (filteredSiparisler.length === 0) {
        clearMap();
        clearMapRoutes();
        alert("Belirtilen takip numarasına sahip sipariş bulunamadı.");
    } else {
        clearMap();
        clearMapRoutes();
        addSiparisToMap(filteredSiparisler);
    }
};

const clearMap = () => {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
};

const clearMapRoutes = () => {
    map.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
};

const map = L.map('map').setView([41.085179476812556, 28.94947845161198], 12);

const googleLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: 'geowix',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    tileSize: 256
})

googleLayer.addTo(map);

const marker = L.marker([51.5, -0.09])

marker.addTo(map);

const addSiparisToMap = (siparisler) => {
    siparisler.forEach((siparis) => {
        const markerColor = siparis.route_id ? siparis.route_color : 'red';

        const locationIcon = L.divIcon({
            className: 'siparis-marker',
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16" fill="${markerColor}">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                            <circle cx="8" cy="6" r="4" fill="white" />
                            <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill="#000" font-size="6">${siparis.route_id ? siparis.sira : ''}</text>
                        </svg>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            backgroundColor: markerColor,
        });

        const icon = L.divIcon({
            className: 'siparis-marker',
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6" fill="red" stroke="gray" stroke-width="1" />
                    </svg>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            backgroundColor: markerColor,
        });

        const marker = L.marker([siparis.latitude, siparis.longitude], {
            icon: siparis.route_id ? locationIcon : icon
        });

        marker.addTo(map);

        if (siparis.route_id) {
            const matchingRoute = rotalarData.find(route => route.route_id === siparis.route_id);
            if (matchingRoute) {
                addRoutesToMap([matchingRoute]);
            }
        }
    });
};

const addRoutesToMap = (routes) => {
    routes.forEach((route) => {
        const routeColor = route.route_color || 'blue';
        const polyline = L.polyline(route.path, { color: routeColor });
        polyline.addTo(map);
    });
};

const addCheckBox = () => {
    rotalarData.forEach(route => {
        const rotaItem = createRotaItem(route);
        const rotaDetails = createRotaDetails(route);

        rotaListesiContainer.appendChild(rotaItem);
        rotaListesiContainer.appendChild(rotaDetails);

        const paketKoliListesiId = `paket_koli_listesi${route.route_id}`;
        const paketKoliListesi = document.getElementById(paketKoliListesiId);
        paketKoliListesi.textContent = route.package_count;


        const noktaId = `nokta${route.route_id}`;
        const nokta = document.getElementById(noktaId);
        nokta.textContent = route.point_count;

        const plnBaslangicTarihiId = `pln_baslangic_tarihi${route.route_id}`;
        const plnBaslangicTarihi = document.getElementById(plnBaslangicTarihiId);
        plnBaslangicTarihi.textContent = route.route_date + " " + route.route_start_time;

        const checkboxId = `checkbox${route.route_id}`;
        const checkbox = document.getElementById(checkboxId);
        if (checkbox.checked) {
            const guzergahId = `guzergah${route.route_id}`;
            const guzergah = document.getElementById(guzergahId);
            const cikisId = `cikis${route.route_id}`;
            const cikis = document.getElementById(cikisId);
            const divId = `div${route.route_id}`;
            const div = document.getElementById(divId);
            guzergah.textContent = route.route_name;
            cikis.textContent = `[ Cıkış ${route.route_start_time} ]`;
            div.style.backgroundColor = route.route_color;
            div.style.borderRadius = "30px";
        }
        checkbox.addEventListener('change', checkboxChangeHandler);
    });
}

const dataRotalar = async () => {
    try {
        const response = await fetch("rotalar.json");
        const data = await response.json();
        rotalarData.push(...data.data);
        addRoutesToMap(rotalarData);
        toplamKmWrite();
        addCheckBox();

    } catch (err) {
        console.error(err);

    }
};

const toplamKmWrite = () => {
    const toplam = rotalarData.reduce((total, route) => total + route.route_km, 0);
    toplamKm.textContent = toplam.toFixed(2);
};

const checkboxChangeHandler = () => {
    clearMapRoutes();
    clearMap();

    let toplam = 0;
    const selectedRoutes = [];

    rotalarData.forEach((route) => {
        const checkbox = document.getElementById(`checkbox${route.route_id}`);

        if (checkbox.checked) {
            addRoutesToMap([route]);
            selectedRoutes.push(route);
            toplam += route.route_km; 
        }
    });

    toplamKm.textContent = toplam.toFixed(2); 

    const filteredSiparisler = siparislerData.filter((siparis) => {
        return selectedRoutes.some((selectedRoute) => siparis.route_id === selectedRoute.route_id);
    });

    addSiparisToMap(filteredSiparisler);
};


const rotaListesiContainer = document.getElementById('rotaListesiContainer');

const createRotaItem = (route) => {
    const div = document.createElement('div');
    div.classList.add('col-12', 'p-3');
    div.id = `div${route.route_id}`;

    const checkbox = document.createElement('input');
    checkbox.classList.add('form-check-input', 'fs-4');
    checkbox.type = 'checkbox';
    checkbox.id = `checkbox${route.route_id}`;
    checkbox.checked = true;

    const guzergahSpan = document.createElement('span');
    guzergahSpan.classList.add('fs-4');
    guzergahSpan.id = `guzergah${route.route_id}`;
    guzergahSpan.textContent = route.route_name;

    const cikisSpan = document.createElement('span');
    cikisSpan.classList.add('fs-4');
    cikisSpan.id = `cikis${route.route_id}`;
    cikisSpan.textContent = `[ Çıkış ${route.route_start_time} ]`;

    const searchIcon = document.createElement('i');
    searchIcon.classList.add('bi', 'bi-search', 'fs-4');

    div.appendChild(checkbox);
    div.appendChild(guzergahSpan);
    div.appendChild(cikisSpan);
    div.appendChild(searchIcon);

    return div;
}

const createRotaDetails = (route) => {
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('row', 'p-3');

    const createColDiv = (colClass, labelContent, spanId, spanContent) => {
        const colDiv = document.createElement('div');
        colDiv.classList.add(colClass, 'p-3');

        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');

        const colLabelDiv = document.createElement('div');
        colLabelDiv.classList.add('col');

        const label = document.createElement('label');
        label.classList.add('form-label', 'fs-5');
        label.textContent = labelContent;

        const colSpanDiv = document.createElement('div');
        colSpanDiv.classList.add('col');

        const span = document.createElement('span');
        span.classList.add('fs-5', 'fw-bold');
        span.id = spanId;
        span.textContent = spanContent;

        colLabelDiv.appendChild(label);
        colSpanDiv.appendChild(span);
        rowDiv.appendChild(colLabelDiv);
        rowDiv.appendChild(colSpanDiv);
        colDiv.appendChild(rowDiv);

        return colDiv;
    };

    detailsDiv.appendChild(createColDiv('col-8', `paket_koli_listesi`, `paket_koli_listesi${route.route_id}`, route.package_count));
    detailsDiv.appendChild(createColDiv('col-4', `nokta`, `nokta${route.route_id}`, route.point_count));
    detailsDiv.appendChild(createColDiv('col-12', `pln_baslangic_tarihi`, `pln_baslangic_tarihi${route.route_id}`, `${route.route_date} ${route.route_start_time}`));

    return detailsDiv;
};

document.addEventListener('DOMContentLoaded', dataSiparisler);
document.addEventListener('DOMContentLoaded', dataSiparislerCity);
document.addEventListener('DOMContentLoaded', dataRotalar);

ilceSecimi.addEventListener('change', showSelectedDistrictPoints);
