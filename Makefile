.PHONY: all build-contract test clean install-deps

# Build all components
all: install-deps build-contract

# Install Rust dependencies
install-deps:
	@echo "Installing Rust toolchain..."
	rustup install nightly-2024-02-07
	rustup target add --toolchain nightly-2024-02-07 wasm32-unknown-unknown
	@echo "Installing cargo-casper..."
	cargo install cargo-casper || true

# Build the smart contract
build-contract:
	@echo "Building CasperClicker smart contract..."
	cd contract && cargo build --release --target wasm32-unknown-unknown
	@echo "✅ Contract built: contract/target/wasm32-unknown-unknown/release/casperclicker.wasm"

# Clean build artifacts
clean:
	cd contract && cargo clean
	rm -rf node_modules

# Deploy to Casper Testnet (requires casper-client CLI)
deploy-testnet:
	@echo "⚠️  To deploy to Testnet, you need:"
	@echo "1. Install casper-client: cargo install casper-client"
	@echo "2. Get testnet tokens from faucet: https://testnet.cspr.live/tools/faucet"
	@echo "3. Run deployment script (see DEPLOYMENT.md)"
	@echo ""
	@echo "Example deploy command:"
	@echo "casper-client put-deploy \\"
	@echo "  --node-address http://65.21.235.219:7777 \\"
	@echo "  --chain-name casper-test \\"
	@echo "  --secret-key ~/casper/secret_key.pem \\"
	@echo "  --payment-amount 100000000000 \\"
	@echo "  --session-path contract/target/wasm32-unknown-unknown/release/casperclicker.wasm"

# Install frontend dependencies
install-frontend:
	npm install

# Run local development server
dev:
	python3 -m http.server 8000

help:
	@echo "CasperClicker - Build Commands"
	@echo "==============================="
	@echo "make install-deps     - Install Rust toolchain and dependencies"
	@echo "make build-contract   - Build smart contract to WASM"
	@echo "make install-frontend - Install npm packages (casper-js-sdk)"
	@echo "make dev              - Run local dev server on port 8000"
	@echo "make clean            - Clean build artifacts"
	@echo "make deploy-testnet   - Show deployment instructions"
