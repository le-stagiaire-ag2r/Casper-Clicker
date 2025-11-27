//! CLI tool for deploying and interacting with CasperClicker smart contract
use casperclicker_contract::casperclicker::CasperClicker;
use odra::host::{HostEnv, NoArgs};
use odra_cli::{
    deploy::DeployScript,
    DeployedContractsContainer, DeployerExt,
    OdraCli,
};

/// Deploys the CasperClicker contract
pub struct CasperClickerDeployScript;

impl DeployScript for CasperClickerDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer
    ) -> Result<(), odra_cli::deploy::Error> {
        CasperClicker::load_or_deploy(
            &env,
            NoArgs,
            container,
            200_000_000_000 // 200 billion gas limit (200 CSPR)
        )?;
        Ok(())
    }
}

pub fn main() {
    OdraCli::new()
        .about("CLI tool for CasperClicker smart contract")
        .deploy(CasperClickerDeployScript)
        .contract::<CasperClicker>()
        .build()
        .run();
}
