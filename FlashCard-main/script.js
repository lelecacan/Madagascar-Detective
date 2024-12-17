/* Array berisi objek yang mendefinisikan pasangan gambar untuk kartu permainan
    jadi kalau mau nambahin kartu disini di variable cards ini */
const cards = [
    { question: "images/1.png", answer: "images/2.png" },
    { question: "images/3.png", answer: "images/4.png" }, 
    { question: "images/5.png", answer: "images/6.png" }, 
    { question: "images/7.png", answer: "images/8.png" }  
];

/* Variabel untuk melacak status permainan dan interval timer */
let isGameStarted = false;
let timerInterval;

/* Mendapatkan elemen DOM (Document Object Model) yang akan digunakan untuk menampilkan kartu, tombol mulai, dan timer */
const cardContainer = document.getElementById("card-container"); // Container untuk kartu permainan
const startBtn = document.getElementById("start-btn"); // Tombol untuk memulai/reset permainan
const timerElement = document.getElementById("timer"); // Elemen untuk menampilkan waktu tersisa
const speakerToggle = document.getElementById("speaker-toggle"); // 
const speakerIcon = document.getElementById("speaker-icon");
const backgroundMusic = document.getElementById("background-music");

// Setup untuk audio permainan
let bellSound = new Audio("sound/bell.mp3"); // Suara bel yang diputar saat waktu habis
let isPlaying = false;

/* Fungsi untuk mengacak urutan kartu */
function shuffle(array) {
    // Memulai iterasi dari elemen terakhir dalam array
    // 'i' adalah indeks untuk elemen yang sedang diproses
    for (let i = array.length - 1; i > 0; i--) {
        // Math.random() menghasilkan angka acak antara 0 (termasuk) dan 1 (tidak termasuk).
        // Math.floor() digunakan untuk membulatkan angka acak ke bawah ke bilangan bulat terdekat.
        // (i + 1) untuk memastikan bahwa angka acak yang dihasilkan berada dalam rentang indeks yang valid (0 hingga i).
        const j = Math.floor(Math.random() * (i + 1)); // Pilih indeks acak dalam rentang 0 hingga i
        
        // [array[i], array[j]] = [array[j], array[i]] adalah teknik destructuring assignment
        // untuk menukar elemen array yang berada di indeks 'i' dan indeks acak 'j'
        // Ini adalah cara untuk menukar dua elemen array tanpa menggunakan variabel tambahan
        [array[i], array[j]] = [array[j], array[i]]; // Tukar elemen pada indeks 'i' dan 'j'
    }
    
    // Mengembalikan array yang sudah diacak
    return array; // Array yang sudah diacak setelah proses selesai
}


/* Fungsi untuk membuat tampilan awal sebelum permainan dimulai */
function createInitialSetup() {
    cardContainer.innerHTML = ""; // Bersihkan semua kartu sebelumnya
    const staticCard = document.createElement("div"); // Membuat elemen kartu statis
    staticCard.classList.add("card"); // Menambahkan kelas 'card' pada elemen
    staticCard.innerHTML = 
    // `
    //     <div class="card-inner">
    //         <div class="card-front">Start</div> <!-- Menampilkan tulisan "Start" pada sisi depan kartu -->
    //         <div class="card-back">Static Card</div> <!-- Menampilkan tulisan "Static Card" pada sisi belakang kartu -->
    //     </div>
    // `;
    
    `
        <div class="card-inner">
            <div class="card-front">
                <img src="images/static_card.png"/> <!-- Ganti dengan gambar yang diinginkan -->
            </div>
            <div class="card-back">Static Card</div> <!-- Menampilkan tulisan "Static Card" pada sisi belakang kartu -->
        </div>
    `;

    cardContainer.appendChild(staticCard); // Menambahkan kartu statis ke dalam container
}

/* Fungsi untuk membuat kartu permainan berdasarkan urutan yang diacak */
function createGameCards() {
    // Mengacak array 'cards' dan menduplikatnya untuk memastikan array asli tidak terubah
    // 'shuffle([...cards])' akan menghasilkan salinan acak dari array 'cards' yang asli.
    // Metode spread '...' digunakan untuk menyalin semua elemen dari 'cards' ke dalam array baru.
    const shuffledCards = shuffle([...cards]); // Mengacak kartu dan menduplikat array cards

    // 'shuffledCards.slice(0, 4)' mengambil 4 elemen pertama dari array yang telah diacak
    // 'slice' membuat salinan dari array, sehingga tidak mempengaruhi array 'shuffledCards' yang asli.
    // 'slice(0, 4)' berarti kita hanya mengambil elemen dari indeks 0 hingga 3 (4 kartu pertama).
    shuffledCards.slice(0, 4).forEach(({ question, answer }) => { // Ambil 4 kartu pertama
        
        // Membuat elemen <div> baru untuk kartu
        const card = document.createElement("div"); // Membuat elemen kartu baru
        
        // Menambahkan kelas 'card' untuk memberi style pada kartu dan kelas 'hidden' untuk menyembunyikan kartu awalnya
        card.classList.add("card", "hidden"); // Menambahkan kelas 'card' dan 'hidden' pada kartu

        // Menambahkan struktur HTML ke dalam elemen kartu yang baru dibuat
        // Di dalam kartu, ada dua sisi: 'card-front' untuk gambar pertanyaan dan 'card-back' untuk gambar jawaban
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${question}" alt="Question Image" /> <!-- Menampilkan gambar pertanyaan -->
                </div>
                <div class="card-back">
                    <img src="${answer}" alt="Answer Image" /> <!-- Menampilkan gambar jawaban -->
                </div>
            </div>
        `;

        // Menambahkan event listener untuk mendeteksi ketika kartu diklik
        card.addEventListener("click", () => { // Menambahkan event listener untuk flip kartu saat diklik
            // Mengecek apakah permainan sudah dimulai dan tombol start tidak dalam keadaan dinonaktifkan
            if (!isGameStarted || startBtn.disabled) return; // Jika game belum dimulai atau tombol start disabled, tidak ada aksi
            
            // Mengubah kelas 'flipped' pada kartu, yang akan membalikkan sisi kartu
            card.classList.toggle("flipped"); // Menambah/menghapus kelas 'flipped' untuk membalikkan kartu
        });

        // Menambahkan elemen kartu yang telah dibuat ke dalam elemen container kartu
        cardContainer.appendChild(card); // Menambahkan kartu ke dalam container
    });
}


/* Fungsi untuk memformat waktu menjadi format MM:SS */
function formatTime(seconds) {
    // Menghitung menit dengan membagi jumlah detik dengan 60 dan membulatkan hasilnya ke bawah
    // Math.floor() digunakan untuk membuang angka desimal dan mendapatkan menit secara utuh
    // String() digunakan untuk mengubah hasilnya menjadi string dan padStart memastikan selalu dua digit
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0"); // Menghitung menit dan memastikan 2 digit

    // Menghitung sisa detik setelah membagi jumlah detik dengan 60
    // Menggunakan modulus (%) untuk mendapatkan sisa detik yang tidak membentuk satu menit penuh
    // String() digunakan untuk mengubah hasilnya menjadi string dan padStart memastikan selalu dua digit
    const secs = String(seconds % 60).padStart(2, "0"); // Menghitung detik dan memastikan 2 digit

    // Mengembalikan waktu dalam format "Time Remaining: 00:MM:SS", dengan menambahkan leading zero pada menit dan detik
    // padStart() digunakan untuk memastikan jika menit atau detik kurang dari 10, maka diawali dengan angka 0
    return `Time Remaining: 00:${mins}:${secs}`; // Mengembalikan format waktu
}


/* Fungsi untuk memulai permainan */
function startGame() {
    // Menandakan bahwa permainan telah dimulai, sehingga status game berubah menjadi true
    isGameStarted = true;

    // Menonaktifkan tombol start agar pengguna tidak dapat menekan tombol Start lagi
    startBtn.disabled = true;

    // Membuat setup awal permainan (misalnya menampilkan kartu statis)
    createInitialSetup();

    // Membuat kartu permainan dengan memanggil fungsi createGameCards
    createGameCards();

    // Mengambil semua elemen kartu yang ada di dalam container kartu
    const allCards = document.querySelectorAll(".card");

    // Mengonversi NodeList menjadi array dan mengambil kartu setelah kartu statis pertama
    const animatedCards = Array.from(allCards).slice(1);

    // Variabel untuk menghitung jumlah kartu yang sudah ditampilkan
    let visibleCount = 0;

    // Menentukan apakah perangkat adalah mobile dengan melihat ukuran layar
    const isMobile = window.innerWidth <= 768;

    // Menggunakan setInterval untuk menampilkan kartu satu per satu setiap 500ms
    const cardInterval = setInterval(() => {
        // Jika sudah ada 4 kartu yang terlihat, berhenti menampilkan kartu
        if (visibleCount >= 4) {
            // Menghentikan interval (menampilkan kartu)
            clearInterval(cardInterval);

            // Memulai timer setelah kartu ditampilkan
            startTimer();
            return;
        }

        // Mengambil kartu yang akan ditampilkan berdasarkan visibleCount
        const currentCard = animatedCards[visibleCount];

        // Menghapus kelas 'hidden' dari kartu sehingga kartu menjadi terlihat
        currentCard.classList.remove("hidden");

        
        // Jika perangkat adalah mobile, gunakan transformasi translateY
        // Jika bukan mobile, gunakan transformasi translateX untuk menata posisi kartu
        if (isMobile) {
            // Pada perangkat mobile, setiap kartu akan digeser ke bawah sedikit demi sedikit
            currentCard.style.transform = `translateY(${visibleCount * 7 + 10}px)`; // Offset sedikit lebih tinggi pada mobile
            // Penjelasan angka:
            // 7: Menentukan seberapa jauh kartu digeser ke bawah setiap kali ditampilkan (berdasarkan urutan).
            // 10: Nilai offset dasar, memastikan kartu pertama mulai dari 10px dari atas layar.
        } else {
            // Pada perangkat desktop (non-mobile), kartu akan digeser ke kanan
            currentCard.style.transform = `translateX(${visibleCount * 120 + 30}px)`; // Offset lebih lebar pada desktop
            // Penjelasan angka:
            // 120: Menentukan seberapa jauh kartu digeser ke kanan setiap kali ditampilkan (berdasarkan urutan).
            // 30: Nilai offset dasar, memastikan kartu pertama mulai dari 30px dari kiri layar.
        }

        // Menambah jumlah kartu yang terlihat, untuk melanjutkan ke kartu berikutnya
        visibleCount++;
    }, 500); // Menampilkan kartu setiap 500ms
}

/* Fungsi untuk memulai timer */
function startTimer() {
    // Menentukan waktu permainan jadi kalian bisa nambahin waktu disini dalam hitungan detik 
    // jadi kalau mau nambah jadi 2 mnt ketik ubah value jadi 120
    let timeRemaining = 10; 
    timerElement.textContent = formatTime(timeRemaining); // Menampilkan waktu awal

    timerInterval = setInterval(() => { // Interval untuk mengurangi waktu setiap detik
        timeRemaining--; // Mengurangi waktu setiap detik
        timerElement.textContent = formatTime(timeRemaining); // Memperbarui tampilan waktu

        if (timeRemaining <= 0) { // Jika waktu habis
            clearInterval(timerInterval); // Menghentikan timer
            bellSound.play(); // Memutar suara bel
            enableReset(); // Mengaktifkan tombol reset
        }
    }, 1000); // Timer berfungsi setiap 1000ms (1 detik)
}

/* Fungsi untuk mengaktifkan tombol reset setelah waktu habis */
function enableReset() {
    startBtn.disabled = false; // Mengaktifkan tombol start
    startBtn.textContent = "Reset"; // Mengubah teks tombol menjadi "Reset"
}

/* Fungsi untuk mereset permainan */
function resetGame() {
    const allCards = document.querySelectorAll(".card"); // Mengambil semua elemen kartu
    const animatedCards = Array.from(allCards).slice(1); // Mengambil kartu setelah kartu statis

    let hiddenCount = 0; // Variabel untuk menghitung kartu yang disembunyikan
    const resetInterval = setInterval(() => { // Interval untuk menyembunyikan kartu satu per satu
        if (hiddenCount >= 4) { // Jika semua kartu sudah disembunyikan
            clearInterval(resetInterval);
            createInitialSetup(); // Membuat setup awal lagi
            isGameStarted = false; // Menandakan bahwa permainan belum dimulai

            // Enable Start button after reset animation
            startBtn.disabled = false; // Mengaktifkan tombol start
            startBtn.textContent = "Start"; // Mengubah teks tombol menjadi "Start"
            return;
        }
        const currentCard = animatedCards[hiddenCount]; // Mengambil kartu berikutnya untuk disembunyikan
        currentCard.style.transform = "translateX(0px)"; // Menyetel transformasi kartu
        currentCard.classList.add("hidden"); // Menambahkan kelas 'hidden' untuk menyembunyikan kartu
        hiddenCount++; // Meningkatkan jumlah kartu yang disembunyikan
    }, 500); // Menyembunyikan kartu setiap 500ms
}

/* Menambahkan event listener pada tombol start/reset untuk memulai atau mereset permainan */
startBtn.addEventListener("click", () => {
    if (startBtn.textContent === "Reset") { // Jika tombol berisi "Reset"
        resetGame(); // Mereset permainan
    } else {
        startGame(); // Memulai permainan
    }
});

speakerToggle.addEventListener("click", () => {
    if (isPlaying) {
        backgroundMusic.play(); // Memainkan musik
        speakerIcon.classList.replace("fa-volume-mute", "fa-volume-up"); // Ubah ikon menjadi mute
    } else {
        backgroundMusic.pause(); // Putar musik
        speakerIcon.classList.replace("fa-volume-up", "fa-volume-mute"); // Ubah ikon menjadi volume up
    }
    isPlaying = !isPlaying; // Toggle state
});
