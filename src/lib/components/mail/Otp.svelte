<script lang="ts">
    interface Props {
        otp: string | number;
    }
    let { otp }: Props = $props();
</script>

<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background-color: #0a0a0a; color: #f5f5f5; padding: 40px 20px; text-align: center;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #171717; padding: 40px; border-radius: 16px; border: 1px solid #262626; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
     
     <h1 style="margin-top: 0; color: #e5e5e5; font-size: 24px; font-weight: 600;">
         Kode Verifikasi Anda
     </h1>
     
     <p style="color: #a3a3a3; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
         Gunakan kode di bawah ini untuk melanjutkan proses verifikasi. Kode ini bersifat rahasia dan hanya berlaku selama beberapa menit.
     </p>
        <div style="background-color: #262626; padding: 20px 30px; border-radius: 12px; display: inline-block; border: 1px solid #404040;">
           <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #818cf8; margin-right: -12px;">
               {otp}
        </span>
    </div>
    <p style="color: #737373; font-size: 14px; margin-top: 32px; margin-bottom: 0; line-height: 1.5;">
        Jika Anda tidak meminta kode ini, Anda bisa mengabaikan email ini dengan aman.
        </p>
    </div>
    
    <div style="margin-top: 24px; color: #525252; font-size: 12px;">
        &copy; {new Date().getFullYear()} Zalfa Hanif. All rights reserved.
    </div>
</div>