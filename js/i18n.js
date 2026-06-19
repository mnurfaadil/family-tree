const I18n = (() => {
  const STORAGE_KEY = 'family-tree-lang';

  const translations = {
    en: {
      'app.title': 'Family Tree',
      'app.desc': 'A privacy-first, offline-capable family tree editor. Encrypt and manage your family genealogy locally in your browser.',
      'app.members': '{0} members',
      'header.add': '+ Add Member',
      'header.save': 'Save',
      'header.load': 'Load',
      'header.export': 'Export',
      'header.import': 'Import',
      'header.merge': 'Merge',
      'header.new': 'New',
      'lang.en': 'English',
      'lang.id': 'Bahasa Indonesia',
      'search.placeholder': 'Search members...',
      'search.noMembers': 'No members yet. Click "+ Add Member" to start.',
      'search.unknown': 'Unknown',
      'detail.empty': 'Select a member to view details',
      'detail.edit': 'Edit',
      'detail.delete': 'Del',
      'detail.birth': 'Birth: {0}',
      'detail.work': 'Work: {0}',
      'detail.education': 'Education: {0}',
      'detail.religion': 'Religion: {0}',
      'detail.marital': 'Marital: {0}',
      'detail.hobby': 'Hobby: {0}',
      'detail.father': 'Father: {0}',
      'detail.mother': 'Mother: {0}',
      'detail.spouse': 'Spouse: {0}',
      'detail.children': 'Children: {0}',
      'modal.add': 'Add Member',
      'modal.edit': 'Edit Member',
      'modal.fullName': 'Full Name *',
      'modal.birth': 'Date of Birth',
      'modal.father': 'Father',
      'modal.mother': 'Mother',
      'modal.spouse': 'Spouse',
      'modal.none': '\u2014 None \u2014',
      'modal.occupation': 'Occupation',
      'modal.education': 'Education',
      'modal.hobby': 'Hobby',
      'modal.marital': 'Marital Status',
      'modal.select': '\u2014 Select \u2014',
      'modal.religion': 'Religion',
      'modal.notes': 'Notes',
      'modal.cancel': 'Cancel',
      'modal.update': 'Update',
      'modal.addBtn': 'Add',
      'modal.nameReq': 'Name is required',
      'confirm.deleteTitle': 'Delete "{0}"?',
      'confirm.delete': 'Delete',
      'confirm.cancel': 'Cancel',
      'confirm.newTree': 'Create a new tree? Current data will be lost.',
      'tree.resetLayout': 'Reset Layout',
      'header.sidebar': 'Toggle sidebar',
      'pwd.title.save': 'Encrypt & Save to Browser',
      'pwd.title.load': 'Load from Browser Storage',
      'pwd.title.export': 'Export to .enc File',
      'pwd.title.import': 'Open .enc File',
      'pwd.title.merge': 'Enter Password for Merge File',
      'pwd.placeholder': 'Enter master password',
      'pwd.required': 'Password is required',
      'error.ok': 'OK',
      'error.emptyTree': 'Tree is empty. Add members first.',
      'error.exportFail': 'Export failed: {0}',
      'error.invalidFile': 'Invalid family tree file format',
      'success.saved': 'Tree saved to browser storage!',
      'success.loaded': 'Tree loaded from browser storage: {0}',
      'success.exported': 'Tree exported to .enc file!',
      'success.imported': 'Tree imported from file: {0}',
      'success.merged': 'Merged {0} members from "{1}"',
      'tooltip.birth': 'Birth: {0}',
      'tooltip.work': 'Work: {0}',
      'tooltip.education': 'Education: {0}',
      'tooltip.religion': 'Religion: {0}',
      'tooltip.marital': 'Marital: {0}',
      'tooltip.hobby': 'Hobby: {0}',
      'legend.active': 'Active',
      'legend.parents': 'Parents',
      'legend.grandparents': 'Grandparents',
      'legend.siblings': 'Siblings',
      'legend.spouse': 'Spouse',
      'legend.children': 'Children',
      'legend.merged': 'Merged (dashed)',
    },
    id: {
      'app.title': 'Pohon Keluarga',
      'app.desc': 'Editor pohon keluarga yang mengutamakan privasi dan dapat digunakan offline. Enkripsi dan kelola silsilah keluarga Anda langsung di browser.',
      'app.members': '{0} anggota',
      'header.add': '+ Tambah Anggota',
      'header.save': 'Simpan',
      'header.load': 'Muat',
      'header.export': 'Ekspor',
      'header.import': 'Impor',
      'header.merge': 'Gabung',
      'header.new': 'Baru',
      'lang.en': 'English',
      'lang.id': 'Bahasa Indonesia',
      'search.placeholder': 'Cari anggota...',
      'search.noMembers': 'Belum ada anggota. Klik "+ Tambah Anggota" untuk memulai.',
      'search.unknown': 'Tidak Dikenal',
      'detail.empty': 'Pilih anggota untuk melihat detail',
      'detail.edit': 'Ubah',
      'detail.delete': 'Hapus',
      'detail.birth': 'Lahir: {0}',
      'detail.work': 'Pekerjaan: {0}',
      'detail.education': 'Pendidikan: {0}',
      'detail.religion': 'Agama: {0}',
      'detail.marital': 'Status: {0}',
      'detail.hobby': 'Hobi: {0}',
      'detail.father': 'Ayah: {0}',
      'detail.mother': 'Ibu: {0}',
      'detail.spouse': 'Pasangan: {0}',
      'detail.children': 'Anak: {0}',
      'modal.add': 'Tambah Anggota',
      'modal.edit': 'Ubah Anggota',
      'modal.fullName': 'Nama Lengkap *',
      'modal.birth': 'Tanggal Lahir',
      'modal.father': 'Ayah',
      'modal.mother': 'Ibu',
      'modal.spouse': 'Pasangan',
      'modal.none': '\u2014 Kosong \u2014',
      'modal.occupation': 'Pekerjaan',
      'modal.education': 'Pendidikan',
      'modal.hobby': 'Hobi',
      'modal.marital': 'Status Perkawinan',
      'modal.select': '\u2014 Pilih \u2014',
      'modal.religion': 'Agama',
      'modal.notes': 'Catatan',
      'modal.cancel': 'Batal',
      'modal.update': 'Simpan',
      'modal.addBtn': 'Tambah',
      'modal.nameReq': 'Nama wajib diisi',
      'confirm.deleteTitle': 'Hapus "{0}"?',
      'confirm.delete': 'Hapus',
      'confirm.cancel': 'Batal',
      'confirm.newTree': 'Buat pohon baru? Data saat ini akan hilang.',
      'tree.resetLayout': 'Atur Ulang Tata Letak',
      'header.sidebar': 'Alihkan sidebar',
      'pwd.title.save': 'Enkripsi & Simpan ke Browser',
      'pwd.title.load': 'Muat dari Penyimpanan Browser',
      'pwd.title.export': 'Ekspor ke File .enc',
      'pwd.title.import': 'Buka File .enc',
      'pwd.title.merge': 'Masukkan Kata Sandi untuk File Gabungan',
      'pwd.placeholder': 'Masukkan kata sandi utama',
      'pwd.required': 'Kata sandi wajib diisi',
      'error.ok': 'OK',
      'error.emptyTree': 'Pohon kosong. Tambah anggota terlebih dahulu.',
      'error.exportFail': 'Gagal mengekspor: {0}',
      'error.invalidFile': 'Format file pohon keluarga tidak valid',
      'success.saved': 'Pohon tersimpan di penyimpanan browser!',
      'success.loaded': 'Pohon dimuat dari penyimpanan browser: {0}',
      'success.exported': 'Pohon berhasil diekspor ke file .enc!',
      'success.imported': 'Pohon diimpor dari file: {0}',
      'success.merged': 'Berhasil menggabungkan {0} anggota dari "{1}"',
      'tooltip.birth': 'Lahir: {0}',
      'tooltip.work': 'Pekerjaan: {0}',
      'tooltip.education': 'Pendidikan: {0}',
      'tooltip.religion': 'Agama: {0}',
      'tooltip.marital': 'Status: {0}',
      'tooltip.hobby': 'Hobi: {0}',
      'legend.active': 'Aktif',
      'legend.parents': 'Orang Tua',
      'legend.grandparents': 'Kakek-Nenek',
      'legend.siblings': 'Saudara',
      'legend.spouse': 'Pasangan',
      'legend.children': 'Anak',
      'legend.merged': 'Gabungan (garis putus)',
    }
  };

  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  function t(key, ...args) {
    const lang = translations[currentLang];
    if (!lang) return key;
    let str = lang[key];
    if (str === undefined) {
      str = translations.en[key] || key;
    }
    if (args.length) {
      args.forEach((arg, i) => {
        str = str.replace(new RegExp(`\\{${i}\\}`, 'g'), arg);
      });
    }
    return str;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (translations[lang]) {
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang === 'id' ? 'id' : 'en';
      return true;
    }
    return false;
  }

  function getLanguages() {
    return Object.keys(translations);
  }

  document.documentElement.lang = currentLang === 'id' ? 'id' : 'en';

  return { t, getLang, setLang, getLanguages };
})();
