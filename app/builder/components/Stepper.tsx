import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Step,
    StepLabel,
    Stepper as MuiStepper,
    Typography
} from '@mui/material';

type StepperItem = {
    label: string;
    optional?: boolean;
};

type BuilderStepperProps = {
    steps?: StepperItem[];
    activeStep?: number;
    orientation?: 'horizontal' | 'vertical';
    linear?: boolean;
    alternativeLabel?: boolean;
    showControls?: boolean;
    showStatusText?: boolean;
    stepPrefixText?: string;
    completedText?: string;
    backLabel?: string;
    nextLabel?: string;
    skipLabel?: string;
    finishLabel?: string;
    resetLabel?: string;
    className?: string;
};

const FALLBACK_STEPS: StepperItem[] = [
    { label: 'Select campaign settings' },
    { label: 'Create an ad group', optional: true },
    { label: 'Create an ad' }
];

export const Stepper = ({
    steps = FALLBACK_STEPS,
    activeStep = 0,
    orientation = 'horizontal',
    linear = true,
    alternativeLabel = true,
    showControls = true,
    showStatusText = true,
    stepPrefixText = 'Step',
    completedText = "All steps completed - you're finished",
    backLabel = 'Back',
    nextLabel = 'Next',
    skipLabel = 'Skip',
    finishLabel = 'Finish',
    resetLabel = 'Reset',
    className = ''
}: BuilderStepperProps) => {
    const safeSteps = useMemo(
        () => (Array.isArray(steps) && steps.length > 0 ? steps : FALLBACK_STEPS),
        [steps]
    );
    const safeInitialStep = Math.max(0, Math.min(activeStep, safeSteps.length));

    const [currentStep, setCurrentStep] = useState(safeInitialStep);
    const [skipped, setSkipped] = useState<Set<number>>(new Set());

    useEffect(() => {
        setCurrentStep(safeInitialStep);
        setSkipped(new Set());
    }, [safeInitialStep, safeSteps.length]);

    const isStepOptional = (stepIndex: number) => Boolean(safeSteps[stepIndex]?.optional);
    const isStepSkipped = (stepIndex: number) => skipped.has(stepIndex);
    const completedAll = currentStep >= safeSteps.length;

    const handleNext = () => {
        const nextSkipped = new Set(skipped);
        if (isStepSkipped(currentStep)) {
            nextSkipped.delete(currentStep);
        }
        setSkipped(nextSkipped);
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    const handleSkip = () => {
        if (!isStepOptional(currentStep)) return;
        setSkipped((prev) => {
            const next = new Set(prev);
            next.add(currentStep);
            return next;
        });
        setCurrentStep((prev) => prev + 1);
    };

    const handleReset = () => {
        setCurrentStep(0);
        setSkipped(new Set());
    };

    return (
        <Box className={className}>
            <MuiStepper
                activeStep={currentStep}
                orientation={orientation}
                alternativeLabel={orientation === 'horizontal' ? alternativeLabel : false}
                nonLinear={!linear}
            >
                {safeSteps.map((step, index) => (
                    <Step key={`${step.label}-${index}`} completed={isStepSkipped(index) ? false : undefined}>
                        <StepLabel
                            optional={step.optional ? <Typography variant="caption">Optional</Typography> : undefined}
                        >
                            {step.label}
                        </StepLabel>
                    </Step>
                ))}
            </MuiStepper>

            {showStatusText && (
                <Box sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {completedAll
                            ? completedText
                            : `${stepPrefixText} ${Math.min(currentStep + 1, safeSteps.length)}`}
                    </Typography>
                </Box>
            )}

            {showControls && (
                <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2, gap: 2 }}>
                    {completedAll ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleReset();
                                }}
                            >
                                {resetLabel}
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                color="inherit"
                                disabled={currentStep === 0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleBack();
                                }}
                                sx={{ mr: 1 }}
                            >
                                {backLabel}
                            </Button>
                            <Box sx={{ flex: '1 1 auto' }} />
                            {isStepOptional(currentStep) && (
                                <Button
                                    color="inherit"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleSkip();
                                    }}
                                    sx={{ mr: 1 }}
                                >
                                    {skipLabel}
                                </Button>
                            )}
                            <Button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleNext();
                                }}
                            >
                                {currentStep === safeSteps.length - 1 ? finishLabel : nextLabel}
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};
