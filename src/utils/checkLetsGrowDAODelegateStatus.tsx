export async function checkLetsGrowDAODelegateStatus(address: string): Promise<boolean> {
    const letsgrowSubgraphUrl = "https://api.studio.thegraph.com/query/68573/lets_grow_dao_votingtoken/v0.0.2";
  
    try {
      const response = await fetch(letsgrowSubgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
              query MyQuery($address: Bytes!) {
                delegates(where: {id: $address}) {
                  id
                  lastUpdated
                }
              }
          `,
          variables: {
            address: address.toLowerCase(),
          }
        })
      });
  
      const result = await response.json();
      return result.data.delegates.length > 0 ? true : false;
    } catch (error) {
      console.error("Error querying Let's Grow DAO subgraph:", error);
      return false;
    }
  }
  