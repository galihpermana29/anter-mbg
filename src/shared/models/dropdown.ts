interface DropdownOption {
  value: string;
  label: string;
}

export const jenjangDropdown: DropdownOption[] = [
  {
    value: "TK",
    label: "TK/PAUD",
  },
  {
    value: "SD",
    label: "SD/MI",
  },
  {
    value: "SMP",
    label: "SMP/MTS",
  },
  {
    value: "SMA",
    label: "SMA/MA/SMK",
  },
];

export const orderStatusDropdown: DropdownOption[] = [
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "Siap Diantar",
    label: "Siap Diantar",
  },
  {
    value: "Menuju Sekolah",
    label: "Menuju Sekolah",
  },
  {
    value: "Makanan Diterima",
    label: "Makanan Diterima",
  },
  {
    value: "Piring Siap Diambil",
    label: "Piring Siap Diambil",
  },
  {
    value: "Menuju Dapur",
    label: "Menuju Dapur",
  },
  {
    value: "Selesai",
    label: "Selesai",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
  },
];
