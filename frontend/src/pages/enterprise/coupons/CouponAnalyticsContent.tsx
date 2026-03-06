import { useCoupons } from "@/contexts/CouponContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { couponCategoryLabels } from "@/data/couponMockData";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))"];

const CouponAnalyticsContent = () => {
  const { issuedCoupons, redemptions } = useCoupons();

  const byType = Object.entries(couponCategoryLabels).map(([key, label]) => ({
    name: label,
    issued: issuedCoupons.filter(c => c.couponType === key).length,
    redeemed: redemptions.filter(r => r.couponType === key).length,
  }));

  const statusData = [
    { name: "Active", value: issuedCoupons.filter(c => c.status === "active").length },
    { name: "Partially Used", value: issuedCoupons.filter(c => c.status === "partially_used").length },
    { name: "Fully Redeemed", value: issuedCoupons.filter(c => c.status === "fully_redeemed").length },
    { name: "Expired", value: issuedCoupons.filter(c => c.status === "expired").length },
  ].filter(d => d.value > 0);

  const totalIssued = issuedCoupons.reduce((s, c) => s + c.originalValue, 0);
  const totalRedeemed = redemptions.reduce((s, r) => s + r.amount, 0);
  const totalRemaining = issuedCoupons.reduce((s, c) => s + c.remainingValue, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Issued Value</p><p className="text-2xl font-bold text-foreground">₹{totalIssued.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Redeemed</p><p className="text-2xl font-bold text-foreground">₹{totalRedeemed.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Outstanding Balance</p><p className="text-2xl font-bold text-foreground">₹{totalRemaining.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Usage by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="issued" fill="hsl(var(--primary))" name="Issued" radius={[4, 4, 0, 0]} />
                <Bar dataKey="redeemed" fill="hsl(var(--accent))" name="Redeemed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Coupon Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CouponAnalyticsContent;
