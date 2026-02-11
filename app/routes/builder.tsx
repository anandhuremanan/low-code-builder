
import { BuilderProvider } from '../builder/context';
import { BuilderLayout } from '../builder/components/BuilderLayout';

export default function BuilderPage() {
    return (
        <BuilderProvider>
            <BuilderLayout />
        </BuilderProvider>
    );
}
