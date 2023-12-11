
const sidebar = document.getElementById('sidebarId');
const sidebarBefore = document.getElementById('sidebar-before');
const arowLeft = document.getElementById('arow-left');

const paketKoliListesi1 = document.getElementById('paket_koli_listesi1');
const nokta1 = document.getElementById('nokta1');
const plnBaslangicTarihi1 = document.getElementById('pln_baslangic_tarihi1');

const paketKoliListesi2 = document.getElementById('paket_koli_listesi2');
const nokta2 = document.getElementById('nokta2');
const plnBaslangicTarihi2 = document.getElementById('pln_baslangic_tarihi2');

const ilSecimi = document.getElementById('ilSecimi');
const ilceSecimi = document.getElementById('ilceSecimi');

const checkbox1 = document.getElementById('checkbox1');
const checkbox2 = document.getElementById('checkbox2');

const guzergah1 = document.getElementById('guzergah1');
const cikis1 = document.getElementById('cikis1');

const guzergah2 = document.getElementById('guzergah2');
const cikis2 = document.getElementById('cikis2');

const div1 = document.getElementById('div1');
const div2 = document.getElementById('div2');

let siparislerData = [];
let rotalarData = [];

sidebarBefore.addEventListener('click', () => {
    const isOpen = sidebar.style.right === '0px';
    if (isOpen) {
        sidebar.style.right = '-650px';
        arowLeft.style.transform = 'rotate(0deg)';
        arowLeft.style.transition = 'transform 0.9s ease';
    } else {
        sidebar.style.right = '0';
        arowLeft.style.transform = 'rotate(180deg)';
        arowLeft.style.transition = 'transform 0.9s ease';
    }
})

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
    const selectedDistricts = Array.from(ilceSecimi.selectedOptions).map(option => option.value);
    
    if (selectedDistricts.length === 0) {

        const selectedCity = ilSecimi.value;
        const filteredSiparisler = siparislerData.filter(siparis => siparis.city_name === selectedCity);
        addSiparisToMap(filteredSiparisler);
    } else {
        selectedDistricts.forEach(selectedDistrict => {
            const filteredSiparisler = siparislerData.filter(siparis => siparis.district_name === selectedDistrict);
            addSiparisToMap(filteredSiparisler);
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
    const searchText = event.target.value.toLowerCase();
    const filteredSiparisler = siparislerData.filter(siparis =>
        siparis.customer_no.toLowerCase().includes(searchText)
    );

    addSiparisToMap(filteredSiparisler);
};

const handleEnter = (event) => {
    if (event.key === "Enter") {
        searchByOrderNo();
    }
};

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
    });
};


const dataRotalar = async () => {
    try {
        const response = await fetch("rotalar.json");
        const data = await response.json();
        rotalarData.push(...data.data);
        addRoutesToMap(rotalarData);
        toplamKmWrite();

        paketKoliListesi1.textContent = rotalarData[1].package_count;
        nokta1.textContent = rotalarData[1].point_count;
        plnBaslangicTarihi1.textContent = rotalarData[1].route_date + " " + rotalarData[1].route_start_time;

        paketKoliListesi2.textContent = rotalarData[0].package_count;
        nokta2.textContent = rotalarData[0].point_count;
        plnBaslangicTarihi2.textContent = rotalarData[0].route_date + " " + rotalarData[0].route_start_time;
        if (checkbox1.checked) {
            guzergah1.textContent = rotalarData[1].route_name;
            cikis1.textContent = "[ Cikis" + " " + rotalarData[1].route_start_time + " ]";
            div1.style.backgroundColor = rotalarData[1].route_color;
            div1.style.borderRadius = "30px";
        }
        if (checkbox2.checked) {
            guzergah2.textContent = rotalarData[0].route_name;
            cikis2.textContent = "[ Cikis" + " " + rotalarData[0].route_start_time + " ]";
            div2.style.backgroundColor = rotalarData[0].route_color;
            div2.style.borderRadius = "30px";
        }
    } catch (err) {
        console.error(err);
    }
};

const toplamKmWrite = () => {
    const toplamKm = rotalarData.reduce((total, route) => total + route.route_km, 0);
    document.getElementById('toplam_km').textContent = toplamKm.toFixed(2);
};

const addRoutesToMap = (routes) => {
    routes.forEach((route) => {
        const routeColor = route.route_color || 'blue';
        const polyline = L.polyline(route.path, { color: routeColor });
        polyline.addTo(map);
    });
};

const checkboxChangeHandler = () => {
    clearMapRoutes();
    if (checkbox1.checked) {
        addRoutesToMap([rotalarData[1]]);
    }
    if (checkbox2.checked) {
        addRoutesToMap([rotalarData[0]]);
    }
};

document.addEventListener('DOMContentLoaded', dataSiparisler);
document.addEventListener('DOMContentLoaded', dataSiparislerCity);
document.addEventListener('DOMContentLoaded', dataRotalar);

checkbox1.addEventListener('change', checkboxChangeHandler);
checkbox2.addEventListener('change', checkboxChangeHandler);

ilceSecimi.addEventListener('change', showSelectedDistrictPoints);


