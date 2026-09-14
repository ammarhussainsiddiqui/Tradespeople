'use client';
import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { StarIcon } from 'lucide-react';
import { getUserDetails } from '../actions/auth'
import * as Sentry from '@sentry/nextjs';
const QuotesCard = ({ profiles }) => {
    const [quotes, setQuotes] = useState(profiles);

    const accept = async (job) => {
        const user = await getUserDetails();
        try {
            // Update the local state immediately
            const updatedQuotes = quotes.map((q) =>
                q.id === job.id ? { ...q, isAccepted: true } : q
            );
            setQuotes(updatedQuotes);

            // API call to update the server
            const jobResponse = await fetch('/api/quote', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ id: job.id }),
            });

            const jobResult = await jobResponse.json();
            if (!jobResponse.ok || !jobResult.success) {
                // Revert state if the API call fails
                setQuotes(quotes);
                Sentry.captureException("Error updating quote status:", jobResult.message);
            }
        } catch (error) {
            Sentry.captureException('Error:', error);
            setQuotes(quotes); // Revert state on error
        }
    };

    const decline = async (job) => {
        const user = await getUserDetails();
        try {
            // Update the local state immediately to remove the quote
            const updatedQuotes = quotes.filter((q) => q.id !== job.id);
            setQuotes(updatedQuotes);

            // API call to delete the quote
            const jobResponse = await fetch(`/api/quote?id=${job.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
            });

            const jobResult = await jobResponse.json();
            if (!jobResponse.ok || !jobResult.success) {
                // Revert state if the API call fails
                setQuotes(profiles); // Revert to original state
                Sentry.captureException("Error deleting quote:", jobResult.message);
            }
        } catch (error) {
            Sentry.captureException('Error:', error);
            setQuotes(profiles); // Revert on error
        }
    };

    return (
        <div className="grid gap-4">
            {quotes.map((profile) => {
                return (
                    <Card key={profile.id} className="bg-surface flex flex-col md:flex-row p-4 gap-2">
                        <div className="rounded-2xl bg-accent text-accent-foreground md:w-36 md:h-24 w-full h-24 text-center justify-center object-cover">
                            <div className='mt-6 font-bold text-2xl'>
                                € {profile?.quotePrice}
                            </div>
                            <div className=' font-semibold text-xs'>
                                Per Hour
                            </div>
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex flex-row justify-between items-start md:items-center">
                                <div className="flex md:flex-col flex-row justify-between w-full">
                                    <h2 className="text-lg font-bold">
                                        {profile?.tradeperson?.firstName} {profile?.tradeperson?.lastName}
                                    </h2>
                                    <div className="flex items-center gap-1">
                                        <StarIcon size={15} className="text-accent" />
                                        <p className="text-sm">{profile?.rating || 0}/5 (0 reviews)</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2 hidden md:block line-clamp-2 h-9 w-fit pr-2 leading-5">
                                        {profile?.tradeperson?.introduction}
                                    </p>
                                </div>

                                <div className="hidden md:block md:flex flex-col gap-2 mt-2 md:mt-0">
                                    {profile.isAccepted ? (
                                        <Button
                                            variant="default"
                                            className="bg-success text-success-foreground hover:bg-success/90 px-14 hover:text-success-foreground"
                                        >
                                            Accepted
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => accept(profile)}
                                            variant="default"
                                            className="bg-accent text-accent-foreground hover:bg-accent/90 px-14 hover:text-ink-inverse"
                                        >
                                            Accept
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => decline(profile)}
                                        variant="outline"
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </div>

                            <div className="block md:hidden flex flex-row gap-2 mt-2 md:mt-0">
                                {profile.isAccepted ? (
                                    <Button
                                        variant="default"
                                        className="bg-success text-success-foreground hover:bg-success/90 hover:text-success-foreground w-1/2"
                                    >
                                        Accepted
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => accept(profile)}
                                        variant="default"
                                        className="bg-accent text-accent-foreground hover:bg-accent/90 hover:text-ink-inverse w-1/2"
                                    >
                                        Accept
                                    </Button>
                                )}
                                <Button
                                    onClick={() => decline(profile)}
                                    className="w-1/2"
                                    variant="outline"
                                >
                                    Decline
                                </Button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default QuotesCard;
