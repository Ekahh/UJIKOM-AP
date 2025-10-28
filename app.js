    const SUPABASE_URL = '';
    const SUPABASE_KEY = '';

    // koneksi klien Supabase
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    if (client) {
        console.log('Berhasil terhubung ke Supabase!');
    } else {
        console.error('GAGAL terhubung ke Supabase. Cek URL dan Key.');
    }

    // ambil elemen html penting
    const barangTableContainer = document.getElementById('barang-table-container');
    const peminjamanTableContainer = document.getElementById('peminjaman-table-container');
    const log = document.getElementById('output-log');

    // menampilkan pesan di log html
    function tulisLog(pesan, tipe = 'sukses') {
        if (tipe === 'error') {
            log.innerHTML += `<p class="log-error"><strong>Error:</strong> ${pesan}</p>`;
        } else {
            log.innerHTML += `<p class="log-sukses"><strong>Sukses:</strong> ${pesan}</p>`;
        }
        log.scrollTop = log.scrollHeight;
    }

    // fungsi untuk menunjukkan tabel peminjaman
    function renderPeminjamanTable(data) {
        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>ID Pinjam</th>
                        <th>Barang</th>
                        <th>Peminjam</th>
                        <th>Status</th>
                        <th>Tgl Request</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (const item of data) {
            tableHtml += `
                <tr>
                    <td>${item.id_peminjaman}</td>
                    
                    <td>${item.tabel_barang ? item.tabel_barang.nama_barang : 'N/A'}</td>
                    <td>${item.tabel_pengguna ? item.tabel_pengguna.nama_pengguna : 'N/A'}</td>
                    
                    <td>${item.status_pinjam}</td>
                    <td>${new Date(item.tgl_request).toLocaleString('id-ID')}</td>
                </tr>
            `;
        }
        
        tableHtml += '</tbody></table>';
        peminjamanTableContainer.innerHTML = tableHtml;
    }

    // tombol "Request Pinjam"
    async function handleRequestPinjam() {
        // ambil nilai dari input
        const penggunaId = document.getElementById('req-pengguna-id').value;
        const barangId = document.getElementById('req-barang-id').value;

        if (!penggunaId || !barangId) {
            tulisLog('ID Pengguna dan ID Barang tidak boleh kosong.', 'error');
            return;
        }

        tulisLog(`Mengirim request: Pengguna ${penggunaId}, Barang ${barangId}...`);

        // panggil ke fungsi 'request_pinjam' di Supabase
        const { data, error } = await client.rpc('request_pinjam', {
            p_id_pengguna: penggunaId,
            p_id_barang: barangId
        });

        if (error) {
            tulisLog(error.message, 'error');
        } else {
            tulisLog(data, 'sukses');
        }
    }

    // tombol "Setujui"
    async function handleSetujuiPinjam() {
        const pinjamId = document.getElementById('setuju-pinjam-id').value;

        if (!pinjamId) {
            tulisLog('ID Peminjaman tidak boleh kosong.', 'error');
            return;
        }

        tulisLog(`Menyetujui ID Peminjaman: ${pinjamId}...`);

        // panggil ke fungsi 'setujui_pinjam'
        const { data, error } = await client.rpc('setujui_pinjam', {
            p_id_peminjaman: pinjamId
        });

        if (error) {
            tulisLog(error.message, 'error');
        } else {
            tulisLog(data, 'sukses');
        }
    }

    // tombol "Kembalikan"
    async function handleKembalikanBarang() {
        const pinjamId = document.getElementById('kembali-pinjam-id').value;

        if (!pinjamId) {
            tulisLog('ID Peminjaman tidak boleh kosong.', 'error');
            return;
        }

        tulisLog(`Mengembalikan ID Peminjaman: ${pinjamId}...`);

        // Panggil ke fungsi 'kembalikan_barang'
        const { data, error } = await client.rpc('kembalikan_barang', {
            p_id_peminjaman: pinjamId
        });

        if (error) {
            tulisLog(error.message, 'error');
        } else {
            tulisLog(data, 'sukses');
        }
    }

    // tombol "Tambah Barang"
    async function handleTambahBarang() {
        const nama = document.getElementById('add-nama').value;
        const kategori = document.getElementById('add-kategori').value;
        const stokTotal = document.getElementById('add-stok-total').value;

        if (!nama || !kategori || !stokTotal) {
            tulisLog('Semua field Tambah Barang harus diisi.', 'error');
            return;
        }

        tulisLog(`Menambahkan barang baru: ${nama}...`);

        // set stok_tersedia = stok_total saat barang baru dibuat
        const { error } = await client
            .from('tabel_barang')
            .insert({ 
                nama_barang: nama, 
                kategori: kategori, 
                stok_total: stokTotal,
                stok_tersedia: stokTotal,
                stok_rusak: 0 
            });

        if (error) {
            tulisLog(error.message, 'error');
        } else {
            tulisLog(`Barang '${nama}' berhasil ditambahkan.`, 'sukses');
            fetchData(); 
        }
    }

    // tombol "Update Stok"
    async function handleUpdateStok() {
        const id = document.getElementById('update-id').value;
        const stokTersedia = document.getElementById('update-stok-tersedia').value;
        const stokRusak = document.getElementById('update-stok-rusak').value;

        if (!id || !stokTersedia || !stokRusak) {
            tulisLog('Semua field Update Stok harus diisi.', 'error');
            return;
        }

        tulisLog(`Mengupdate stok untuk barang ID: ${id}...`);

        const { error } = await client
            .from('tabel_barang')
            .update({ 
                stok_tersedia: stokTersedia,
                stok_rusak: stokRusak
            })
            .eq('id_barang', id);

        if (error) {
            tulisLog(error.message, 'error');
        } else {
            tulisLog(`Stok barang ID ${id} berhasil diupdate.`, 'sukses');
            fetchData();
        }
    }

    // tombol "Hapus Barang"
    async function handleHapusBarang() {
        const id = document.getElementById('delete-id').value;

        if (!id) {
            tulisLog('ID Barang untuk dihapus tidak boleh kosong.', 'error');
            return;
        }

        if (!confirm(`Anda yakin ingin menghapus barang dengan ID ${id}? Aksi ini tidak bisa dibatalkan.`)) {
            tulisLog('Aksi hapus dibatalkan.', 'sukses');
            return;
        }

        tulisLog(`Menghapus barang ID: ${id}...`);

        const { error } = await client
            .from('tabel_barang')
            .delete()
            .eq('id_barang', id);

        if (error) {
            tulisLog(error.message, 'error');
        } else {
            tulisLog(`Barang ID ${id} berhasil dihapus.`, 'sukses');
            fetchData();
        }
    }

    // fungsi untuk mengambil data semua tabel
    async function fetchData() {
        tulisLog('Memuat data tabel terbaru...', 'sukses');
        
        // ambil data dari tabel_barang
        const { data: barang, error: errBarang } = await client
            .from('tabel_barang')
            .select('*') // 'select *' artinya ambil semua kolom
            .order('id_barang'); // Urutkan berdasarkan ID

        if (errBarang) {
            tulisLog(`Gagal mengambil data Barang: ${errBarang.message}`, 'error');
        } else {
            renderBarangTable(barang); // Kirim data untuk digambar
        }
        
        // ambil data dari tabel_peminjaman
        const { data: peminjaman, error: errPeminjaman } = await client
            .from('tabel_peminjaman')
            .select(`
                id_peminjaman,
                status_pinjam,
                tgl_request,
                tabel_barang (nama_barang),
                tabel_pengguna (nama_pengguna)
            `)
            .order('id_peminjaman', { ascending: false });

        if (errPeminjaman) {
            tulisLog(`Gagal mengambil data Peminjaman: ${errPeminjaman.message}`, 'error');
        } else {
            renderPeminjamanTable(peminjaman);
        }
    }

    // merender tabel_barang
    function renderBarangTable(data) {
        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Barang</th>
                        <th>Kategori</th>
                        <th>Stok Total</th>
                        <th>Stok Tersedia</th>
                        <th>Stok Rusak</th>
                        <th>Stok Dipinjam</th> 
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (const item of data) {
            // hitung stok dipinjam
            const stokDipinjam = item.stok_total - item.stok_tersedia - (item.stok_rusak || 0);

            tableHtml += `
                <tr>
                    <td>${item.id_barang}</td>
                    <td>${item.nama_barang}</td>
                    <td>${item.kategori}</td>
                    <td>${item.stok_total}</td>
                    <td>${item.stok_tersedia}</td>
                    <td>${item.stok_rusak || 0}</td> <td>${stokDipinjam}</td> </tr>
            `;
        }
        
        tableHtml += '</tbody></table>';
        barangTableContainer.innerHTML = tableHtml;
    }

    // Event Listener
    document.addEventListener('DOMContentLoaded', () => {
        // listener setiap tombol
        document.getElementById('btn-request').addEventListener('click', handleRequestPinjam);
        document.getElementById('btn-setuju').addEventListener('click', handleSetujuiPinjam);
        document.getElementById('btn-kembali').addEventListener('click', handleKembalikanBarang);
        document.getElementById('btn-add-barang').addEventListener('click', handleTambahBarang);
        document.getElementById('btn-update-stok').addEventListener('click', handleUpdateStok);
        document.getElementById('btn-delete-barang').addEventListener('click', handleHapusBarang);

        // listener ke tombol refresh
        document.getElementById('btn-refresh-data').addEventListener('click', fetchData);

        // listener untuk tombol clear log
        document.getElementById('btn-clear-log').addEventListener('click', () => {
            log.innerHTML = '<p>Log dibersihkan...</p>';
        });

        console.log('Event listener berhasil dipasang. Aplikasi siap.');
        
        // panggil fetchData() pertama kali saat halaman dibuka
        fetchData();
    });

    // algoritma
function bubbleSort(arr) {
    let n = arr.length;
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                let temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
    return arr;
}