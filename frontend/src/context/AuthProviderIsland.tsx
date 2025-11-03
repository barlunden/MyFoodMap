import { AuthProvider } from "./AuthContext";

import type { ReactNode } from "react";

export default function AuthProviderIsland({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}