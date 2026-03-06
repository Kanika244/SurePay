import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import KPICard from "@/components/admin/KPICard";
import { Ticket, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(24, 95%, 53%)", "hsl(152, 69%, 41%)", "hsl(217, 91%, 60%)"];

const CouponAnalytics = () => {
  const { issuedCoupons, redemptions } = useCoupons();

  const totalIssued = issuedCoupons.length;
  const totalRedeemed = issuedCoupons.filter(c => c.status === 'fully_redeemed').length;
  const totalExpired = issuedCoupons.filter(c => c.status === 'expired').length;
  const totalRedeemedValue = redemptions.reduce((s, r) => s + r.amount, 0);

  // Usage by type
  const typeData = (['fuel', 'food', 'accommodation'] as const).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    issued: issuedCoupons.filter(c => c.couponType === type).length,
    redeemed: redemptions.filter(r => r.couponType === type).reduce((s, r) => s + r.amount, 0),
  }));

  // Utilization pie
  const utilizationData = [
    { name: 'Redeemed', value: totalRedeemed },
    { name: 'Active', value: issuedCoupons.filter(c => c.status === 'active' || c.status === 'partially_used').length },
    { name: 'Expired', value: totalExpired },
  ];

  // Top merchants
  const merchantSpend: Record<string, { name: string; total: number }> = {};
  redemptions.forEach(r => {
    if (!merchantSpend[r.merchantId]) merchantSpend[r.merchantId] = { name: r.merchantName, total: 0 };
    merchantSpend[r.merchantId].total += r.amount;
  });
  const topMerchants = Object.values(merchantSpend).sort((a, b) => b.total - a.total).slice(0, 5);

  // Top employees
  const empSpend: Record<string, { name: string; total: number }> = {};
  redemptions.forEach(r => {
    if (!empSpend[r.employeeId]) empSpend[r.employeeId] = { name: r.employeeName, total: 0 };
    empSpend[r.employeeId].total += r.amount;
  });
  const topEmployees = Object.values(empSpend).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <EnterpriseLayout title="Coupon Analytics" subtitle="Insights into coupon usage and performance">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Issued" value={totalIssued} icon={Ticket} />
        <KPICard title="Fully Redeemed" value={totalRedeemed} icon={CheckCircle} delay={0.05} />
        <KPICard title="Expired" value={totalExpired} icon={XCircle} delay={0.1} />
        <KPICard title="Total Redeemed Value" value={`₹${totalRedeemedValue.toLocaleString()}`} icon={TrendingUp} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Coupon Usage by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="issued" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} name="Issued Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Coupon Utilization</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={utilizationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {utilizationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Top Merchants by Spend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topMerchants} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={150} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="total" fill="hsl(152, 69%, 41%)" radius={[0, 4, 4, 0]} name="Spend" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Employees by Coupon Usage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topEmployees} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="total" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} name="Used" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </EnterpriseLayout>
  );
};

export default CouponAnalytics;
