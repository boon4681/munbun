
import { format } from 'prettier/standalone';
import prettierPluginXML from '@prettier/plugin-xml';
import { toast } from 'svelte-sonner';

export const beautifySql = async (source: string) => {
    try {
        const prettyQuery = await format(source, {
            parser: 'xml',
            plugins: [prettierPluginXML],
        });

        toast.success('XML prettified');
        return prettyQuery
    } catch (e) {
        toast.error('Error occurred while prettifying Sql query');
    }
};