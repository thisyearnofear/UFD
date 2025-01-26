const WalletManager = {
  provider: null,
  rpcEndpoint:
    "https://frequent-withered-surf.solana-mainnet.quiknode.pro/c980208c0896a2be88b9ea59315aa350d415d4f1",

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

  // Resolve domain name for a wallet using Bonfida SDK proxy
  async resolveDomain(publicKey) {
    try {
      console.log("🔍 Attempting to resolve domain for:", publicKey);

      // Check cache first
      const cachedDomain = localStorage.getItem(`domain_${publicKey}`);
      if (cachedDomain) {
        console.log("✅ Found domain in cache:", cachedDomain);
        return cachedDomain;
      }

      // If not in cache, fetch from API
      const response = await fetch(
        `https://sns-sdk-proxy.bonfida.workers.dev/domains/${publicKey}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📡 API response:", data);

      if (
        data.s === "ok" &&
        Array.isArray(data.result) &&
        data.result.length > 0
      ) {
        const domainData = data.result[0];
        const domain = `${domainData.domain}.sol`;
        console.log("✅ Found domain:", domain);

        // Cache the result
        localStorage.setItem(`domain_${publicKey}`, domain);

        return domain;
      }

      // Cache null result to avoid repeated lookups
      localStorage.setItem(`domain_${publicKey}`, "");
      return null;
    } catch (err) {
      console.error("❌ Error resolving domain:", err);
      return null;
    }
  },

  // Update UI elements
  async updateUI(publicKey) {
    const connectBtn = document.getElementById("wallet-connect");
    const disconnectBtn = document.getElementById("wallet-disconnect");
    const addressDisplay = document.getElementById("wallet-address");

    if (publicKey) {
      const address = publicKey.toString();
      connectBtn.style.display = "none";
      disconnectBtn.style.display = "block";
      addressDisplay.style.display = "block";

      // Show loading state
      addressDisplay.textContent = "Loading...";

      // Try to resolve domain
      const domain = await this.resolveDomain(address);

      // Update display with domain or shortened address
      if (domain) {
        addressDisplay.innerHTML = `<span style="color: #1DA1F2">${domain}</span>`;
      } else {
        addressDisplay.textContent = `${address.slice(0, 4)}...${address.slice(
          -4
        )}`;
      }
    } else {
      connectBtn.style.display = "block";
      disconnectBtn.style.display = "none";
      addressDisplay.style.display = "none";
    }
  },
};

// Export for use in other modules
window.WalletManager = WalletManager;

// Initialize WalletManager and export ready promise
window.walletManagerReady = (async () => {
  try {
    console.log("🚀 Initializing WalletManager...");
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      await new Promise((resolve) =>
        document.addEventListener("DOMContentLoaded", resolve)
      );
    }

    // Initialize WalletManager
    WalletManager.initialize();

    console.log(
      "✅ WalletManager initialized with methods:",
      Object.keys(WalletManager)
    );
    console.log("✅ resolveDomain method:", WalletManager.resolveDomain);

    // Return the initialized WalletManager
    return WalletManager;
  } catch (err) {
    console.error("❌ Error initializing WalletManager:", err);
    throw err;
  }
})();
