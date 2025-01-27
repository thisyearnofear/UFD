const LeaderboardService = {
  SUPABASE_URL: "https://yaujbylztaqrgezrplur.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdWpieWx6dGFxcmdlenJwbHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMDU3ODYsImV4cCI6MjA1MzU4MTc4Nn0.tjugsOwwh-k1GvNu-tJwvDyYr2iyH9C_nFc5Z_Ysy2k",

  async initialize() {
    try {
      console.log("🚀 Initializing LeaderboardService...");
      this.supabase = supabase.createClient(
        this.SUPABASE_URL,
        this.SUPABASE_ANON_KEY
      );
      console.log("✅ Supabase client created");

      // Initialize local scores if not exists
      if (!localStorage.getItem("aiInvasionScores")) {
        localStorage.setItem("aiInvasionScores", "[]");
      }
      console.log("✅ Local storage initialized");
    } catch (err) {
      console.error("❌ Error initializing LeaderboardService:", err);
      throw err;
    }
  },

  // Helper to normalize score object
  normalizeScore(score) {
    return {
      score: score.score || 0,
      timestamp: score.timestamp || Date.now(),
      isLocal: !!score.isLocal,
      anonymous_id: score.anonymous_id || null,
      wallet_address: score.wallet_address || score.publicKey || null, // Handle old format
      signature: score.signature || null,
    };
  },

  // Get combined scores from both local and remote
  async getAllScores(limit = 10) {
    try {
      // Get local scores - only get the current player's latest score
      const allLocalScores = JSON.parse(
        localStorage.getItem("aiInvasionScores") || "[]"
      );
      const anonymousId = localStorage.getItem("anonymous_id");

      // Get only the highest score for the current player
      const currentPlayerScore = allLocalScores
        .filter((score) => score.anonymous_id === anonymousId)
        .sort((a, b) => b.score - a.score)[0];

      const localScores = currentPlayerScore
        ? [this.normalizeScore(currentPlayerScore)]
        : [];
      console.log("Local scores:", localScores);

      // Get remote scores only if Supabase is initialized
      let remoteScores = [];
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from("scores")
          .select("*")
          .order("score", { ascending: false })
          .limit(limit);

        if (!error && data) {
          remoteScores = data.map((score) => this.normalizeScore(score));
        }
        console.log("Remote scores:", remoteScores);
      }

      // Combine and sort scores
      const allScores = [...localScores, ...remoteScores]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      console.log("Combined scores:", allScores);

      return {
        local: localScores,
        remote: remoteScores,
        combined: allScores,
      };
    } catch (err) {
      console.error("Error fetching scores:", err);
      return {
        local: [],
        remote: [],
        combined: [],
      };
    }
  },

  // Update addLocalScore to only keep the top scores
  addLocalScore(score) {
    try {
      const scores = JSON.parse(
        localStorage.getItem("aiInvasionScores") || "[]"
      );
      const anonymousId =
        localStorage.getItem("anonymous_id") ||
        `Player_${Math.random().toString(36).substr(2, 9)}`;

      const newScore = this.normalizeScore({
        score: score,
        timestamp: Date.now(),
        isLocal: true,
        anonymous_id: anonymousId,
      });

      // Store anonymous_id if not exists
      if (!localStorage.getItem("anonymous_id")) {
        localStorage.setItem("anonymous_id", anonymousId);
      }

      // Add new score
      scores.push(newScore);

      // Keep only top 5 scores per player
      const filteredScores = scores
        .sort((a, b) => b.score - a.score)
        .reduce((acc, score) => {
          const playerScores = acc.filter(
            (s) => s.anonymous_id === score.anonymous_id
          );
          if (playerScores.length < 5) {
            acc.push(score);
          }
          return acc;
        }, []);

      localStorage.setItem("aiInvasionScores", JSON.stringify(filteredScores));
      return true;
    } catch (err) {
      console.error("Error saving local score:", err);
      return false;
    }
  },

  // Submit verified score to Supabase
  async submitVerifiedScore(score, walletAddress, signature, timestamp) {
    try {
      // Prevent test data
      if (walletAddress === "test_wallet") {
        throw new Error("Invalid wallet address");
      }

      const { data, error } = await this.supabase.from("scores").insert([
        {
          score,
          wallet_address: walletAddress,
          signature,
          timestamp,
        },
      ]);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error submitting verified score:", err);
      throw err;
    }
  },

  async submitScore(score, walletAddress, signature, timestamp) {
    try {
      const { data, error } = await this.supabase.from("scores").insert([
        {
          score,
          wallet_address: walletAddress,
          signature,
          timestamp,
        },
      ]);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error submitting score:", err);
      throw err;
    }
  },

  async getTopScores(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching top scores:", err);
      throw err;
    }
  },

  async getPlayerRank(walletAddress) {
    try {
      const { data, error } = await this.supabase.rpc("get_player_rank", {
        player_wallet: walletAddress,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching player rank:", err);
      throw err;
    }
  },

  async testConnection() {
    try {
      console.log("Testing Supabase connection...");

      // Test basic query
      const { data: scores, error: queryError } = await this.supabase
        .from("scores")
        .select("*")
        .limit(1);

      if (queryError) throw queryError;
      console.log("✅ Query test successful");

      // Test RPC function
      const { data: rank, error: rpcError } = await this.supabase.rpc(
        "get_player_rank",
        {
          player_wallet: "test_wallet",
        }
      );

      if (rpcError) throw rpcError;
      console.log("✅ RPC test successful");

      return true;
    } catch (err) {
      console.error("❌ Supabase connection test failed:", err);
      return false;
    }
  },
};

window.LeaderboardService = LeaderboardService;
