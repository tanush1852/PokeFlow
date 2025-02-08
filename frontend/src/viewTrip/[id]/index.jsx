import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/service/fireBaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import InfoSection from '@/pages/InfoSection';

function ViewTrip() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    const GetMarksData = useCallback(async () => {
        if (!id) return;

        try {
            const docRef = doc(db, 'marksData', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document:", docSnap.data());
                setData(docSnap.data());
            } else {
                console.log("No such document");
                toast("No data found");
                setData(null); // Clear data when no document is found
            }
        } catch (error) {
            console.error("Error fetching document:", error);
            toast("Error fetching data");
            setData(null);
        }
    }, [id]);

    useEffect(() => {
        GetMarksData();
    }, [GetMarksData]);

    return (
        <div>
            {data ? <InfoSection data={data} /> : <p>Loading...</p>}
        </div>
    );
}

export default ViewTrip;
