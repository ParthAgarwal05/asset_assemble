// import { faker } from '@faker-js/faker';
import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { firebaseConfig, app, firestore } from 'src/sections/user/asset-data.mjs';
import { getDatabase, ref, query, orderByChild, endAt, child, get } from "firebase/database";

// import Iconify from 'src/components/iconify';

// import AppTasks from '../app-tasks';
// import AppNewsUpdate from '../app-news-update';
// import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
// import AppTrafficBySite from '../app-traffic-by-site';
// import AppCurrentSubject from '../app-current-subject';
import AppConversionRates from '../app-conversion-rates';

// ----------------------------------------------------------------------

export default function AppView() {
  const [assets] = useState([{
    type: 'Solved',
    quantity: 10 ,
    price: 1000 ,
    warranty: 5 ,
    maintainance: 2 ,
    complaints: 100
  } ,
  {
    type: 'Critical unsolved',
    quantity: 4 ,
    price: 200 ,
    warranty: 5 ,
    maintainance: 2 ,
    complaints: 200
  } ,
  {
    type: 'Unsolved',
    quantity: 13 ,
    price: 0 ,
    warranty: 5 ,
    maintainance: 2 ,
    complaints: 500
  }]);
  const expenditure = (items) => {
    let sum = 0;
    for (let i = 0; i < items.length; i += 1) {
      sum += items[i].quantity * items[i].price;
    }
    return sum;
  };
  const curr_complaints = (items) => {
    let sum = 0;
    for (let i = 0; i < items.length; i += 1) {
      sum += items[i].complaints;
    }
    return sum;
  };

  const [data, setData] = useState([]);

  async function calculateMaintenanceCost(maxDate) {
    const db = getDatabase();
    const assetsRef = ref(db, 'assets');
  
    try {
      // Query to get assets where `next-maintainence` <= maxDate
      const assetsQuery = query(
        assetsRef,
        orderByChild('next_maintainence'),
        endAt(maxDate) // Filter for dates less than or equal to maxDate
      );
  
      const snapshot = await get(assetsQuery);
  
      if (snapshot.exists()) {
        const assets = snapshot.val();
        let totalMaintenanceCost = 0;
  
        for (const assetKey in assets) {
          const asset = assets[assetKey];
          const nextMaintainenceDate = new Date(asset['next_maintainence']);
          const warrantyPeriod = asset['warranty'] || 0; // Warranty period in years
  
          // Assuming assetKey is a timestamp
          const creationDate = new Date(parseInt(assetKey, 10));
          const warrantyEndDate = new Date(creationDate);
          warrantyEndDate.setFullYear(creationDate.getFullYear() + warrantyPeriod);
  
          // Check if next maintenance date is within warranty period
          if (nextMaintainenceDate > warrantyEndDate) {
            totalMaintenanceCost += asset['maintainence_cost'] || 0;
          }
        }
  
        console.log("Total Maintenance Cost:", totalMaintenanceCost);
        console.log(totalMaintenanceCost);
        return totalMaintenanceCost;
      } else {
        console.log("No data available");
        return 0;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return 0;
    }
  }

  // useEffect(() => {
  //   const dbRef = ref(getDatabase());
  //   get(child(dbRef, `budget`)).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       const retrievedData = snapshot.val();
  //       const extractedData = Object.values(retrievedData).map(item => ({
  //         date: item.date,
  //         alloted: item.alloted,
  //         required: calculateMaintenanceCost(item.date) || 0,
  //       }));
  //       setData(extractedData);
  //       console.log(extractedData);
  //     } else {
  //       console.log("No data available");
  //     }
  //   }).catch((error) => {
  //     console.error(error);
  //   });
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(getDatabase());
        const snapshot = await get(child(dbRef, `budget`));
  
        if (snapshot.exists()) {
          const retrievedData = snapshot.val();
          const dataArray = Object.values(retrievedData);
  
          // Fetch maintenance costs for all items
          const extractedData = await Promise.all(dataArray.map(async (item) => {
            const requiredCost = await calculateMaintenanceCost(item.date) || 0;
            return {
              date: item.date,
              alloted: item.alloted,
              required: requiredCost,
            };
          }));
  
          setData(extractedData);
          console.log(extractedData);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Current budget"
            total={1500000}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Current expenditure"
            total={expenditure(assets)}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Current Complaints"
            total={curr_complaints(assets)}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Solved complaints"
            total={20}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Budget Allocation"
            subheader=""
            chart={{
              // labels: [
              //   '01/01/2003',
              //   '02/01/2003',
              //   '03/01/2003',
              //   '04/01/2003',
              //   '05/01/2003',
              //   '06/01/2003',
              //   '07/01/2003',
              //   '08/01/2003',
              //   '09/01/2003',
              //   '10/01/2003',
              //   '11/01/2003',
              // ]
              labels: data.map(item => {
                if (typeof item.date === 'string') {
                  console.log("Correct");
                  // Format the date properly
                  const [month, day, year] = item.date.split('-');
                  // Convert to desired format if necessary
                  return new Date("${day}/${month}/${year}").toISOString; // For example, `DD/MM/YYYY`
                } else {
                  console.log("Incorrect");
                  return ''; // Fallback if date is not a string
                }
              }),
              series: [
                {
                  name: 'Budget',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 77, 88],
                },
                {
                  name: 'Requirement',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 90, 77],
                },
              ],
            }}
          />
        </Grid> */}
        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Budget Allocation"
            subheader=""
            chart={{
              labels: data.map(item => {
                if (typeof item.date === 'string') {
                  console.log("Correct");
                  // Format the date properly
                  const [month, day, year] = item.date.split('-');
                  // Convert to desired format
                  const formattedDate = new Date(`${year}-${month}-${day}`).toISOString(); // Format as YYYY-MM-DD
                  return formattedDate;
                } else {
                  console.log("Incorrect");
                  return ''; // Fallback if date is not a string
                }
              }),
              series: [
                {
                  name: 'Budget',
                  type: 'area',
                  fill: 'gradient',
                  data: data.map(item => item.alloted || 0),
                },
                {
                  name: 'Requirement',
                  type: 'line',
                  fill: 'solid',
                  data: data.map(item => item.required || 0),
                },
              ],
            }}
          />
        </Grid>


        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Complaint Distributrion"
            chart={{
              series: assets.map(asset => ({
                label: asset.type.charAt(0).toUpperCase() + asset.type.slice(1), 
                value: asset.complaints,
              })),
            }}
          />
        </Grid>

        <Grid xs={12} md={12} lg={12}>
          <AppConversionRates
            title="Complaints"
            chart={{
              series: assets.map(asset => ({
                label: asset.type.charAt(0).toUpperCase() + asset.type.slice(1), 
                value: asset.complaints,
              })),
            }}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={4}>
          <AppCurrentSubject
            title="Current Subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={8}>
          <AppNewsUpdate
            title="News Update"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: faker.person.jobTitle(),
              description: faker.commerce.productDescription(),
              image: `/assets/images/covers/cover_${index + 1}.jpg`,
              postedAt: faker.date.recent(),
            }))}
          />
        </Grid> */}

        {/* <Grid xs={12} md={6} lg={4}>
          <AppOrderTimeline
            title="Order Timeline"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: [
                '1983, orders, $4220',
                '12 Invoices have been paid',
                'Order #37745 from September',
                'New order placed #XF-2356',
                'New order placed #XF-2346',
              ][index],
              type: `order${index + 1}`,
              time: faker.date.past(),
            }))}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTrafficBySite
            title="Traffic by Site"
            list={[
              {
                name: 'FaceBook',
                value: 323234,
                icon: <Iconify icon="eva:facebook-fill" color="#1877F2" width={32} />,
              },
              {
                name: 'Google',
                value: 341212,
                icon: <Iconify icon="eva:google-fill" color="#DF3E30" width={32} />,
              },
              {
                name: 'Linkedin',
                value: 411213,
                icon: <Iconify icon="eva:linkedin-fill" color="#006097" width={32} />,
              },
              {
                name: 'Twitter',
                value: 443232,
                icon: <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={32} />,
              },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppTasks
            title="Tasks"
            list={[
              { id: '1', name: 'Create FireStone Logo' },
              { id: '2', name: 'Add SCSS and JS files if required' },
              { id: '3', name: 'Stakeholder Meeting' },
              { id: '4', name: 'Scoping & Estimations' },
              { id: '5', name: 'Sprint Showcase' },
            ]}
          />
        </Grid> */}
      </Grid>
    </Container>
  );
}
