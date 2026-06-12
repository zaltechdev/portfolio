<script lang="ts">
    interface Props {
        title: string;
        description: string;
    }
    let { title, description }: Props = $props();
</script>

<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background-color: #0a0a0a; color: #f5f5f5; padding: 40px 20px;">
    <h1 style="margin-top: 0; color: #e5e5e5; font-size: 24px; font-weight: 600;">
        {title}
    </h1>
    
    <div style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
        {@html description}
    </div>
    
    <div style="margin-top: 24px; text-align: center; color: #525252; font-size: 12px;">
        &copy; {new Date().getFullYear()} Zalfa Hanif. All rights reserved.
    </div>
</div>