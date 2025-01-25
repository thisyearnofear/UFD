const WalletManager = {
  provider: null,

  // Check if Phantom is installed
  getProvider() {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        this.provider = provider;
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
    return null;
  },

  // Initialize wallet listeners
  initialize() {
    this.provider = this.getProvider();
    if (!this.provider) return;

    // Handle account changes
    this.provider.on("accountChanged", (publicKey) => {
      if (publicKey) {
        console.log(`Switched to account ${publicKey.toBase58()}`);
        this.updateUI(publicKey);
      } else {
        // Try to reconnect
        this.connect().catch(console.error);
      }
    });

    // Try eager connection on init
    this.tryEagerConnect();
  },

  // Try to connect without user prompt if already trusted
  async tryEagerConnect() {
    try {
      const resp = await this.provider.connect({ onlyIfTrusted: true });
      this.updateUI(resp.publicKey);
    } catch (err) {
      // Not previously connected, that's okay
      console.log("Not previously connected");
    }
  },

  // Connect with user prompt
  async connect() {
    try {
      const resp = await this.provider.connect();
      this.updateUI(resp.publicKey);
      return resp.publicKey;
    } catch (err) {
      if (err.code === 4001) {
        console.log("User rejected the connection");
      }
      throw err;
    }
  },

  // Disconnect wallet
  async disconnect() {
    try {
      await this.provider.disconnect();
      this.updateUI(null);
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  },

  // Sign score for verification
  async signScore(score) {
    if (!this.provider?.publicKey) return null;

    try {
      const message = new TextEncoder().encode(
        `Verify AI Invasion Score: ${score} at ${Date.now()}`
      );
      const signature = await this.provider.signMessage(message, "utf8");
      return {
        signature,
        publicKey: this.provider.publicKey.toString(),
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error("Error signing score:", err);
      return null;
    }
  },

  // Update UI elements
  updateUI(publicKey) {
    const connectBtn = document.getElementById("wallet-connect");
    const disconnectBtn = document.getElementById("wallet-disconnect");
    const addressDisplay = document.getElementById("wallet-address");

    if (publicKey) {
      const address = publicKey.toString();
      connectBtn.style.display = "none";
      disconnectBtn.style.display = "block";
      addressDisplay.style.display = "block";
      addressDisplay.textContent = `${address.slice(0, 4)}...${address.slice(
        -4
      )}`;
    } else {
      connectBtn.style.display = "block";
      disconnectBtn.style.display = "none";
      addressDisplay.style.display = "none";
    }
  },
};

// Export for use in other modules
window.WalletManager = WalletManager;
