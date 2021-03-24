from spectra_parser import fetch_results


df = fetch_results('http://192.168.31.227:3000/api/task/result')
print(df)
df.to_csv('data.csv', index=None)
