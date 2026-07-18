import { theme } from "./theme.js";

export default function Profile() {
  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>Cashier Profile</h1>
        <p style={styles.subtitle}>Your account details</p>
      </header>

      <div style={styles.card}>
        <div style={styles.avatar}>👤</div>
        <div>
          <div style={styles.name}>Cashier User</div>
          <div style={styles.role}>Finance Desk Staff</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontFamily: theme.font.display,
    fontWeight: 800,
    fontSize: 26,
    color: theme.colors.ink,
    margin: 0,
  },
  subtitle: {
    color: theme.colors.inkMuted,
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    background: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 28,
    boxShadow: theme.shadow.card,
    border: `1px solid ${theme.colors.border}`,
    display: "flex",
    alignItems: "center",
    gap: 18,
    maxWidth: 420,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: `${theme.colors.mint}1A`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
  },
  name: {
    fontWeight: 700,
    color: theme.colors.ink,
    fontSize: 16,
  },
  role: {
    color: theme.colors.inkMuted,
    fontSize: 13.5,
    marginTop: 2,
  },
};