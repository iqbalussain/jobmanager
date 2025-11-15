export interface BranchConfig {
  name: string;
  address: string[];
  phone: string;
  email: string;
  website?: string;
  logoPath?: string;
}

export const BRANCH_CONFIGS: Record<string, BranchConfig> = {
  "Head Office": {
    name: "Head Office",
    address: [
      "P.O. Box 1817",
      "Muscat, Sultanate of Oman"
    ],
    phone: "+968 9175 2973",
    email: "print@printwavesoman.com",
    website: "www.printwavesoman.com"
  },
  "Wadi Kabeer": {
    name: "Wadi Kabeer Branch",
    address: [
      "Wadi Kabeer",
      "Muscat, Sultanate of Oman"
    ],
    phone: "+968 2458 5678",
    email: "wadikabeer@company.com"
  },
  "Wajihat Ruwi": {
    name: "Wajihat Ruwi Branch",
    address: [
      "Ruwi",
      "Muscat, Sultanate of Oman"
    ],
    phone: "+968 2458 9012",
    email: "ruwi@company.com"
  },
  "Ruwi Branch": {
    name: "Ruwi Branch",
    address: [
      "Ruwi Commercial District",
      "Muscat, Sultanate of Oman"
    ],
    phone: "+968 2458 3456",
    email: "ruwibranch@company.com"
  },
  "Ghubra Branch": {
    name: "Ghubra Branch",
    address: [
      "Ghubra",
      "Muscat, Sultanate of Oman"
    ],
    phone: "+968 2458 7890",
    email: "ghubra@company.com"
  }
};
"Al Khoud Branch": {
    name: "Al Khoud Branch",
    address: [
      "Al Khoud",
      "Muscat, Sultanate of Oman"
    ],
    phone: "+968 2458 7890",
    email: "AlKhoud@company.com"
export const getBranchConfig = (branchName: string): BranchConfig | null => {
  return BRANCH_CONFIGS[branchName] || null;
};