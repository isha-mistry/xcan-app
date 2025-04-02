import { NextRequest, NextResponse } from 'next/server';
import { Client, cacheExchange, fetchExchange, gql } from 'urql';
export const revalidate = 0;

const op_client = new Client({
    url: 'https://api.studio.thegraph.com/query/68573/op/v0.0.9',
    exchanges: [cacheExchange, fetchExchange],
});
const arb_client = new Client({
    url: 'https://api.studio.thegraph.com/query/68573/arb_token/version/latest',
    exchanges: [cacheExchange, fetchExchange],
});
const letsgrow_client = new Client({
    url: "https://api.studio.thegraph.com/query/68573/lets_grow_dao_votingtoken/v0.0.2",
    exchanges: [cacheExchange, fetchExchange],
});
  
const DELEGATE_QUERY = gql`
query MyQuery($id: String!) {
  delegates(where:{id: $id}) {
    latestBalance
    id
    blockTimestamp
  }
}
`;
const LETSGROW_DELEGATE_QUERY = gql`
query MyQuery($id: String!) {
  delegates(where:{id: $id}) {
    delegatedBalance
    id
  }
}
`;
export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address')?.toLowerCase();
        const dao = searchParams.get('dao');
        if (!address || !dao) {
            return NextResponse.json({ error: 'Address and DAO parameters are required.' }, { status: 400 });
        }
        let data;
        if(dao==="optimism"){
         data = await op_client.query(DELEGATE_QUERY,{id:address}).toPromise();
        }else if(dao==="arbitrum"){
          data = await arb_client.query(DELEGATE_QUERY,{id:address}).toPromise();
        }else{
        data= await letsgrow_client.query(LETSGROW_DELEGATE_QUERY,{id:address}).toPromise();
        }
        if (!data?.data?.delegates || data.data.delegates.length === 0) {
          return NextResponse.json([]);
         }
        return NextResponse.json(data.data.delegates);
    } catch (e) {
        console.log(e);
        return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
    }
}