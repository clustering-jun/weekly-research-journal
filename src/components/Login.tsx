import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "./ui";

type Props = {
  secretKey: string;
  onSuccess: () => void;
};

export function Login({ secretKey, onSuccess }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value === secretKey) onSuccess();
    else setError("시크릿 키가 올바르지 않습니다.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Lock size={20} />
          </div>
          <CardTitle>주간 연구 일지</CardTitle>
          <p className="text-sm text-muted-foreground">개인용 접근 제한을 위해 시크릿 키를 입력하세요.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Input type="password" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Secret Key" autoFocus />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit">접속</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
