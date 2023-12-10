
// function toggleSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     const isOpen = sidebar.style.right === '0px';

//     if (isOpen) {
//         sidebar.style.right = '-250px';
//     } else {
//         sidebar.style.right = '0';
//     }
// }

const ilSecimi = document.getElementById('ilSecimi');
const ilceSecimi = document.getElementById('ilceSecimi');

// Şehir isimlerini tutacak olan dizi
let siparislerData = [];

// Siparişleri servisten al ve haritaya ekle
const dataSiparisler = async () => {
    try {
        const response = await fetch("siparisler.json");
        const data = await response.json();

        addSiparisToMap(data.data);
        siparislerData = data.data;
        addCitysToSelect(siparislerData.map(siparis => siparis.city_name));
    } catch (error) {
        console.error('Siparişleri alma hatası:', error);
    }
};

dataSiparisler();

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
        console.log(error);
    }
};

dataSiparislerCity();

const addDistrictsToSelect = (districts) => {
    for (const district of districts) {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        ilceSecimi.appendChild(option);
    }

    ilceSecimi.addEventListener('change', () => {
        const selectedDistrict = ilceSecimi.value;
        showSelectedDistrictPoints(selectedDistrict);
    });
};

const showSelectedDistrictPoints = (selectedDistrict) => {
    clearMap();
    const filteredSiparisler = siparislerData.filter(siparis => siparis.district_name === selectedDistrict);
    addSiparisToMap(filteredSiparisler);
};

const addCitysToSelect = (cities) => {
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        ilSecimi.appendChild(option);
    });

    ilSecimi.addEventListener('change', () => {
        const selectedCity = ilSecimi.value;
        showSelectedCityPoints(selectedCity);
        updateIlceSelect(selectedCity);
    });
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
    console.log(event.target.value)
    clearMap();
    const searchText = event.target.value.toLowerCase();
    const filteredSiparisler = siparislerData.filter(siparis =>
        siparis.customer_no.toLowerCase().includes(searchText)
    );

    addSiparisToMap(filteredSiparisler);
};

// Enter tuşunu yakala ve takip numarası aramasını tetikle
const handleEnter = (event) => {
    if (event.key === "Enter") {
        searchByOrderNo();
    }
};

// Takip numarasına göre siparişleri filtrele ve haritaya ekle
const searchByOrderNo = () => {
    clearMap();
    const takipNoInput = document.getElementById('takip_no');
    const searchOrderNo = takipNoInput.value.trim();

    if (searchOrderNo === "") {
        alert("Lütfen bir takip numarası girin.");
        return;
    }

    const filteredSiparisler = siparislerData.filter(siparis => siparis.order_no === searchOrderNo);

    if (filteredSiparisler.length === 0) {
        alert("Belirtilen takip numarasına sahip sipariş bulunamadı.");
    } else {
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

// Siparişleri haritaya ekleyen fonksiyon
const addSiparisToMap = (siparisler) => {
    siparisler.forEach((siparis) => {
        const markerColor = siparis.route_id ? siparis.route_color : 'red';

        // DivIcon Oluştur
        const locationIcon = L.divIcon({
            className: 'siparis-marker',
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16" fill="${markerColor}">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                            <circle cx="8" cy="6" r="4" fill="white" />
                            <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill="#000" font-size="6">${siparis.route_id ? siparis.sira : ''}</text>
                        </svg>`,  // Rotası varsa sıra numarasını göster
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
            backgroundColor: markerColor,  // Dilediğiniz bir renk
        });

        if (siparis.route_id) {
            const marker = L.marker([siparis.latitude, siparis.longitude], {
                icon: locationIcon
            });

            marker.addTo(map);
            marker.bindPopup(`Sipariş ID: ${siparis.route_id}<br>Rotanın Sırası: ${siparis.sira}`);
        } else {
            const marker = L.marker([siparis.latitude, siparis.longitude], {
                icon: icon
            });
            marker.addTo(map);
        }
    });
};

const addRoutesToMap = (routes) => {
    routes.forEach((route) => {
        const routeColor = route.route_color || 'blue'; // Eğer route_color belirtilmemişse varsayılan olarak mavi kullan
        const polyline = L.polyline(route.path, { color: routeColor });
        polyline.addTo(map);
    });
};

let rotalarData = [];

const dataRotalar = async () => {
    try {
        const response = await fetch("rotalar.json");
        const data = await response.json();
        rotalarData.push(...data.data);
        addRoutesToMap(rotalarData);
        toplamKmWrite()
        if(checkbox1.checked){
            guzergah1.textContent = rotalarData[1].route_name;
            cikis1.textContent = "[ Cikis" + " " + rotalarData[1].route_start_time + " ]";
            div1.style.backgroundColor = rotalarData[1].route_color;
            div1.style.borderRadius = "30px";
        }
        if(checkbox2.checked){
            guzergah2.textContent = rotalarData[0].route_name;
            cikis2.textContent = "[ Cikis" + " " + rotalarData[0].route_start_time + " ]";
            div2.style.backgroundColor = rotalarData[0].route_color;
            div2.style.borderRadius = "30px";
        }
    } catch (err) {
        console.error(err);
    }
};

dataRotalar();

const toplamKmWrite = () => {
    const toplamKm = rotalarData.reduce((total, route) => total + route.route_km, 0);
    document.getElementById('toplam_km').textContent = toplamKm.toFixed(2);
};

const checkbox1 = document.getElementById('checkbox1');
const checkbox2 = document.getElementById('checkbox2');

const guzergah1 = document.getElementById('guzergah1');
const cikis1 = document.getElementById('cikis1');

const guzergah2 = document.getElementById('guzergah2');
const cikis2 = document.getElementById('cikis2');

const div1 = document.getElementById('div1');
const div2 = document.getElementById('div2');

const checkboxChangeHandler = () => {
    clearMap();
    if (checkbox1.checked) {
        console.log(rotalarData);
        console.log(rotalarData[1]);
        addRoutesToMap([rotalarData[1]]);
    }
    if (checkbox2.checked) {
        console.log(rotalarData[0]);
        addRoutesToMap([rotalarData[0]]);
    }
};

checkbox1.addEventListener('change', checkboxChangeHandler);
checkbox2.addEventListener('change', checkboxChangeHandler);

