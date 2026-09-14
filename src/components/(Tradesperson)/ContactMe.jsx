'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Button } from '../ui/button';
import { getUserDetails } from '../../actions/auth'


const ContactMe = ({ tradeid, jobId }) => {
    const [showContactMeDialog, setContactMeDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [twentyFour, setTwentyFour] = useState(null);


    const closeDialog = () => {
        setContactMeDialog(false);
    };



    const updateTheQuote = async () => {
        setLoading(true);
        setContactMeDialog(true);
        try {
            const User = await getUserDetails();
            const response = await fetch(`/api/quote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${User?.token}`,
                },
                cache: "no-cache",
                body: JSON.stringify({
                    userId: User?.id,
                    tradepersonId: tradeid,
                    jobId: jobId
                }),
            });
            const data = await response.json();
            if (data?.success === "four") {
                setTwentyFour(false)
            }
            else if (data?.success) {
                setTwentyFour(true)
            }
            else {
                setTwentyFour(null)
            }
        } catch (error) {
            setTwentyFour(null)
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <>

            {/* Phone Number Dialog */}
            <Dialog open={showContactMeDialog} onOpenChange={closeDialog} className="relative z-60">
                <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
                    <DialogHeader>
                        {loading ? (
                            <div style={{ margin: 'auto 0' }} className='flex items-center h-full justify-center'>
                                <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
                            </div>
                        ) : (
                            <>
                                {twentyFour !== null && (
                                    <>
                                        {
                                            twentyFour === true ?
                                                <div className="flex flex-col items-center">
                                                    <DialogTitle className="text-center font-semibold text-2xl">
                                                        Job details sent successfully.
                                                    </DialogTitle>
                                                    <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                                                        Your job details have been sent to the tradesperson. They will review your request and get in touch with you soon.
                                                    </DialogDescription>

                                                </div>
                                                :
                                                <div className="flex flex-col items-center">
                                                    <DialogTitle className="text-center font-semibold text-2xl">
                                                        Contact Request Already Sent
                                                    </DialogTitle>
                                                    <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                                                        You’ve already requested the tradesperson to contact you about this job in the past 24 hours. To avoid overloading their inbox, you can only send one request per day.
                                                    </DialogDescription>
                                                </div>
                                        }
                                    </>
                                )}
                            </>
                        )}
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Display the option to add a phone number if not already provided */}
            <Button
                onClick={() => updateTheQuote()}
                variant="default"
                className="bg-accent text-accent-foreground hover:bg-primary w-full hover:text-ink-inverse"
            >
                Contact Me
            </Button>
        </>
    );
};

export default ContactMe;
